import { ErrorCode } from './constants';
import { readFileAsDataURL } from './file';
import findIndex from 'lodash/findIndex';
import {
  ImageWorkerRequestEvent,
  ImageWorkerError,
  ImageWorkerActionResult,
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

self.addEventListener('message', async ({ data }: ImageWorkerRequestEvent) => {
  const { id: requestId, file, actions } = data;
  try {
    const index = findIndex(actions, { type: ImageWorkerAction.READ_AS_DATA_URL });
    if (index >= 0) {
      const result = {
        actionId: index,
        payload: {
          url: await readFileAsDataURL(file),
        } as ImageWorkerActionResult,
      };
      self.postMessage({ requestId, result, done: false });
    }
    self.postMessage({ requestId, done: true });
  } catch (error) {
    self.postMessage({ requestId, error: mapError(error), done: true });
  }
});
