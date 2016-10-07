import bluebird from 'bluebird';
import Jimp from './jimp';
import { ErrorCode } from './constants';
import { doesLookLikeCephalometricRadiograph } from './image';
import { readFileAsBuffer } from './file';
import {
  ImageWorkerPayload,
  ImageWorkerRequestEvent,
  ImageWorkerError,
  ImageWorkerActionResult,
  ImageWorkerEdit,
} from './image-worker.d';
import { ImageWorkerAction } from './constants';

declare var self: DedicatedWorkerGlobalScope;

const genericErrorMessage = (
  'Failed to load the image. ' +
  'Make sure it\s a valid image file and that your browser supports images of this type.'
);

function mapError({ message }: Error): ImageWorkerError {
  if (message.match(/mime/ig)) {
    return {
      code: ErrorCode.INCOMPATIBLE_IMAGE_TYPE,
      message: genericErrorMessage,
    };
  } else {
    return {
      message: (
        genericErrorMessage + 
        '\n' +
        `Details: ${message}`
      ),
      code: ErrorCode.UNKNOWN
    };
  }
}

async function performAction(img: Jimp, type: ImageWorkerAction, payload?: ImageWorkerPayload): Promise<ImageWorkerActionResult | void> {
  if (type === ImageWorkerAction.IS_CEPHALO) {
    return await doesLookLikeCephalometricRadiograph(img);
  } else if (type === ImageWorkerAction.PERFORM_EDITS && payload) {
    return {
      url: await bluebird.fromCallback(
        cb => payload.edits.reduce(
          (img: Jimp, edit: ImageWorkerEdit) => img[edit.method](...edit.args),
          img
        ).getBase64(Jimp.MIME_PNG, cb)
      ),
    };
  }
}

self.addEventListener('message', async ({ data }: ImageWorkerRequestEvent) => {
  performance.mark('IMG_WORKER_MESSAGE_RECIEVED');
  const { id: requestId } = data;
  try {
    const { file, actions } = data;
    const buffer = await readFileAsBuffer(file);
    let img = await Jimp.read(buffer);
    await bluebird.map(actions, async (action, actionId) => {
      const result = {
        actionId,
        payload: await performAction(img, action.type, action.payload),
      };
      self.postMessage({ requestId, result, done: false });
    });
    self.postMessage({ requestId, done: true });
  } catch (error) {
    self.postMessage({ requestId, error: mapError(error), done: true });
  }
  performance.mark('IMG_WORKER_MESSAGE_PROCESSED');
  performance.measure(
    'Image worker message',
    'IMG_WORKER_MESSAGE_RECIEVED',
    'IMG_WORKER_MESSAGE_PROCESSED'
  );
});
