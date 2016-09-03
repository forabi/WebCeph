import bluebird from 'bluebird';
import Jimp from '../../utils/jimp';
import { ErrorCode } from '../../utils/constants';
import assign from 'lodash/assign';

import { readFileAsBuffer } from '../../utils/file';

export interface IImageWorker extends Worker {
  postMessage(request: WorkerRequest, transfarables?: any[]): void;
  addEventListener(type: 'message', listener: (event: WorkerEvent) => void): void;
  addEventListener(type: 'error', listener: (event: ErrorEvent ) => void): void;
}

export interface WorkerResponse {
  requestId: string;
  url?: string;
  isCephalo?: boolean;
  error?: WorkerError;
}

export interface WorkerError {
  message: string,
  code: ErrorCode,
}

export type WorkerEvent = Event & { data: WorkerResponse }

export enum WorkerAction {
  PERFORM_EDITS,
  IS_CEPHALO,
}

export interface Edit {
  method: string,
  args: any[]
};

type WorkerPayload = { edits: Edit[] };

export interface WorkerRequest {
  id: string;
  file: File;
  actions: {
    type: WorkerAction,
    payload?: WorkerPayload,
  }[],
}

interface RequestEvent extends MessageEvent {
  data: WorkerRequest;
}

declare var self: DedicatedWorkerGlobalScope;

function mapError({ message }: Error): WorkerError {
  if (message.match(/mime/ig)) {
    return {
      code: ErrorCode.INCOMPATIBLE_IMAGE_TYPE,
      message: (
        'Failed to load the image. ' +
        'Make sure it\s a valid image file and that your browser supports images of this type.'
      )
    };
  } else {
    return { message, code: ErrorCode.UNKNOWN };
  }
}

type ActionResult = { isCephalo: boolean } | { url: string } | { };

async function performAction(img: Jimp, type: WorkerAction, payload?: WorkerPayload): Promise<ActionResult> {
  if (type === WorkerAction.IS_CEPHALO) {
    return { isCephalo: await doesLookLikeCephalometricRadiograph(img) };
  } else if (type === WorkerAction.PERFORM_EDITS && payload) {
    return {
      url: await bluebird.fromCallback(
        cb => payload.edits.reduce(
          (img: Jimp, edit: Edit) => img[edit.method](...edit.args),
          img
        ).getBase64(Jimp.MIME_BMP, cb)
      ),
    };
  } else {
    return { };
  }
}

import { doesLookLikeCephalometricRadiograph } from '../../utils/image';

self.addEventListener('message', async ({ data }: RequestEvent) => {
  const { id: requestId, file, actions } = data;
  try {
    const buffer = await readFileAsBuffer(file);
    let img = await Jimp.read(buffer);
    const results = await bluebird.map(actions, action => performAction(img, action.type, action.payload));
    self.postMessage(assign({ }, ...results, { requestId }) as WorkerResponse);
  } catch (error) {
    self.postMessage({ requestId, error: mapError(error)} as WorkerResponse);
  }
});
