import uniqueId from 'lodash/uniqueId';
import { Action } from '../../utils/constants';
import { takeLatest, eventChannel, END } from 'redux-saga';
import { put, take, fork, call } from 'redux-saga/effects';
import { ImageWorkerAction } from '../../utils/constants';
import { ImageWorkerInstance, ImageWorkerEvent } from '../../utils/image-worker.d';

const ImageWorker = require('worker!../../utils/image-worker');
const worker: ImageWorkerInstance = new ImageWorker;

function processImageInWorker(file: File, actions: any[]) {
  const requestId = uniqueId('worker_request_');
  return eventChannel(emit => {
    const listener = ({ data }: ImageWorkerEvent) => {
      if (data.requestId === requestId) {
        if (data.error) {
          console.error('Got worker error', data);
          throw data.error;
        } else if (data.result) {
          console.info('Got successful worker response', data);
          emit(data.result);
        } else if (data.done) {
          console.info('Worker done processing request %s', requestId);
          emit(END);
        }
      }
    }
    worker.addEventListener('message', listener);
    worker.postMessage({ id: requestId, file, actions });
    return () => {
      // Unsubscribe function
      worker.removeEventListener('message', listener);
    };
  });
}

function* loadImage({ payload }: { payload: { file: File, height: number, width: number } }): any {
  const { file, height, width } = payload;
  const workerId = uniqueId('worker_');
  yield put({ type: Action.WORKER_CREATED, payload: { workerId } });
  const actions = [
    {
      type: ImageWorkerAction.IS_CEPHALO,
    },
    {
      type: ImageWorkerAction.PERFORM_EDITS,
      payload: {
        edits: [{
          method: 'scaleToFit',
          args: [height, width],
        }],
      }
    },
  ];
  const chan = yield call(processImageInWorker, file, actions);
  try {
    yield put({ type: Action.SET_WORKER_STATUS, payload: { workerId, isBusy: true } });
    while (true) {
      const { actionId, payload } = yield take(chan);
      if (actionId === 0) {
        yield put({ type: Action.SET_IS_CEPHALO, payload });
      } else if (actionId === 1) {
        yield put({ type: Action.LOAD_IMAGE_SUCCEEDED, payload: payload.url });
      }
    }
  } catch (error) {
    console.error(error);
    yield put({
      type: Action.LOAD_IMAGE_FAILED,
      payload: error.message,
      error: true,
    });
  } finally {
    chan.close();
    yield put({
      type: Action.SET_WORKER_STATUS,
      payload: {
        workerId,
        isBusy: false,
      },
    });
  }
}

function* watchWorkspace() {
  yield fork(takeLatest, Action.LOAD_IMAGE_REQUESTED, loadImage);
}

export default watchWorkspace;