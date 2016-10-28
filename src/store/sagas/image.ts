import uniqueId from 'lodash/uniqueId';
import { Event } from 'utils/constants';
import { takeLatest, eventChannel, END, Channel } from 'redux-saga';
import { select, put, take, cps, fork, call, Effect } from 'redux-saga/effects';
import { ImageWorkerAction } from 'utils/constants';
import { ImageWorkerInstance, ImageWorkerEvent, ImageWorkerResponse } from 'utils/image-worker.d';
import { setScale } from 'actions/workspace';
import { getCanvasSize } from 'store/reducers/workspace/canvasSize';

const ImageWorker = require('worker!utils/image-worker');

const worker: ImageWorkerInstance = new ImageWorker;

function processImageInWorker(file: File, actions: any[]) {
  const requestId = uniqueId('worker_request_');
  return eventChannel(emit => {
    const listener = ({ data }: ImageWorkerEvent) => {
      if (data.requestId === requestId) {
        emit(data);
        if (data.done) {
          console.info('Worker done processing request %s', requestId);
          emit(END);
        }
      }
    };
    worker.addEventListener('message', listener);
    worker.postMessage({ id: requestId, file, actions });
    return () => {
      // Unsubscribe function
      worker.removeEventListener('message', listener);
    };
  });
}

function* loadImage({ payload }: { payload: { file: File } }): IterableIterator<Effect> {
  const { file } = payload;
  const workerId = uniqueId('worker_');
  yield put({ type: Event.WORKER_CREATED, payload: { workerId } });
  const actions = [
    {
      type: ImageWorkerAction.READ_AS_DATA_URL,
    },
  ];
  const chan: Channel<ImageWorkerResponse> = yield call(processImageInWorker, file, actions);
  try {
    yield put({ type: Event.WORKER_STATUS_CHANGED, payload: { workerId, isBusy: true } });
    while (true) {
      const data: ImageWorkerResponse = yield take(chan);
      if (data.error) {
        console.error('Got worker error', data);
        yield put({ type: Event.LOAD_IMAGE_FAILED, payload: data.error });
      } else if (data.result) {
        console.info('Got successful worker response', data);
        const { actionId, payload } = data.result;
        if (actionId === 0) {
          const img = new Image();
          img.src = payload.url;
          const { height, width } = yield cps((cb) => {
            img.onload = () => {
              const { height, width } = img;
              cb(null, { height, width });
            }
          });
          yield put({
            type: Event.LOAD_IMAGE_SUCCEEDED,
            payload: {
              data: payload.url,
              height,
              width,
            } as Payloads.imageLoadSucceeded,
          });
          const { present: state }: EnhancedState<StoreState> = yield select();
          const { width: canvasWidth, height: canvasHeight } = getCanvasSize(state);
          const scale = 1 / Math.max(height / canvasHeight, width / canvasWidth);
          yield put(setScale(scale));
        }
      }
    }
  } catch (error) {
    console.error(error);
    yield put({
      type: Event.LOAD_IMAGE_FAILED,
      payload: error.message,
      error: true,
    });
  } finally {
    chan.close();
    yield put({
      type: Event.WORKER_STATUS_CHANGED,
      payload: {
        workerId,
        isBusy: false,
      },
    });
  }
}

function* watchImageRequests() {
  yield fork(takeLatest, Event.LOAD_IMAGE_REQUESTED, loadImage);
}

export default watchImageRequests;