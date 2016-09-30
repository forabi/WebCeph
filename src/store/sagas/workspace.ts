import uniqueId from 'lodash/uniqueId';
import { Event } from '../../utils/constants';
import { takeLatest, takeEvery, eventChannel, END, Channel } from 'redux-saga';
import { put, take, fork, call, select, Effect } from 'redux-saga/effects';
import { ImageWorkerAction } from '../../utils/constants';
import { ImageWorkerInstance, ImageWorkerEvent, ImageWorkerResponse } from '../../utils/image-worker.d';
import reject from 'lodash/reject';
import every from 'lodash/every';
import includes from 'lodash/includes';
import find from 'lodash/find';

const ImageWorker = require('worker!../../utils/image-worker');
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
    }
    worker.addEventListener('message', listener);
    worker.postMessage({ id: requestId, file, actions });
    return () => {
      // Unsubscribe function
      worker.removeEventListener('message', listener);
    };
  });
}

function* loadImage({ payload }: { payload: { file: File, height: number, width: number } }): IterableIterator<Effect> {
  const { file, height, width } = payload;
  const workerId = uniqueId('worker_');
  yield put({ type: Event.WORKER_CREATED, payload: { workerId } });
  const actions = [
    {
      type: ImageWorkerAction.PERFORM_EDITS,
      payload: {
        edits: [{
          method: 'scaleToFit',
          args: [width, height],
        }],
      }
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
          yield put({ type: Event.LOAD_IMAGE_SUCCEEDED, payload: payload.url });
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

import {
  activeAnalysisStepsSelector,
  getStepStateSelector,
  mappedLandmarksSelector,
} from '../selectors/workspace';
import { addLandmark, tryAutomaticSteps } from '../../actions/workspace';

const isManual = (step: CephaloLandmark) => step.type === 'point';

function* performAutomaticStep(): IterableIterator<Effect> {
  performance.mark('startAutomaticEvaluation');
  const steps: CephaloLandmark[] = yield select(activeAnalysisStepsSelector);
  const setLandmarks: { [id: string]: GeometricalObject } = yield select(mappedLandmarksSelector);
  const getStepState: (s: CephaloLandmark) => stepState = yield select(getStepStateSelector);
  const eligibleSteps = reject(steps, s => isManual(s) || getStepState(s) !== 'pending');
  for (const step of eligibleSteps) {
    console.info('Evaluationg step %s for automatic tracing', step.symbol);
    if (every(
      step.components,
      component => getStepState(component) === 'done',
    )) {
      console.log('Found step eligible for automatic evaluation', step.symbol);
      yield put({ type: Event.STEP_EVALUATION_STARTED, payload: step.symbol });
      // @TODO: Calculate things here
      if (step.type === 'line') {
        const line: GeometricalLine = {
          x1: setLandmarks[step.components[0].symbol].x,
          y1: setLandmarks[step.components[0].symbol].y,
          x2: setLandmarks[step.components[1].symbol].x,
          y2: setLandmarks[step.components[1].symbol].y,
        };
        yield put(addLandmark(step.symbol, line));
      } else if (step.type === 'angle') {
        yield put(addLandmark(step.symbol, 50));
      }
      yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
      yield put(tryAutomaticSteps());
    } else {
      console.info('Step %s is not eligible for automatic tracing', step.symbol);
    }
  };
  performance.mark('endAutomaticEvaluation');
  performance.measure('automaticEvaluation', 'startAutomaticEvaluation', 'endAutomaticEvaluation');
}

function* watchWorkspace() {
  yield fork(takeLatest, Event.LOAD_IMAGE_REQUESTED, loadImage);
  yield fork(takeLatest, Event.TRY_AUTOMATIC_STEPS_REQUESTED, performAutomaticStep);
}

export default watchWorkspace;