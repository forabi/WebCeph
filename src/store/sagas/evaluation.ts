import { Event } from '../../utils/constants';
import { takeLatest, takeEvery, eventChannel, END, Channel } from 'redux-saga';
import { put, take, fork, call, select, Effect } from 'redux-saga/effects';
import reject from 'lodash/reject';
import every from 'lodash/every';

const EvaluationWorker = require('worker!../../utils/evaluation-worker');

import {
  mappedLandmarksSelector,
  stepsBeingEvaluatedSelector,
  expectedNextLandmarkSelector,
} from '../selectors/workspace';
import { addLandmark, tryAutomaticSteps } from '../../actions/workspace';

import { evaluate } from '../../analyses/helpers';

const isManual = (step: CephaloLandmark) => step.type === 'point';

function evaluateInWorker(state: any) {
  const worker = new EvaluationWorker;
  return eventChannel(emit => {
    const listener = ({ data }: any) => {
      performance.mark('worker done evaluating');
      performance.measure('Evalution in Dedicated Worker', 'worker message sent', 'worker done evaluating');
      if (data === 'END') {
        emit(END);
      } else {
        emit(data);
      }
    }
    performance.mark('worker message sent');
    worker.addEventListener('message', listener);
    worker.postMessage(state);
    return () => {
      worker.removeEventListener('message', listener);
      worker.terminate();
      console.info('Evaluation worker terminated');
    }
  });
}

function* performAutomaticStepInWorker(): IterableIterator<Effect> {
  const mappedLandmarks = yield select(mappedLandmarksSelector);
  const stepsBeingEvaluted = yield select(stepsBeingEvaluatedSelector);
  const expectedLandmark = yield select(expectedNextLandmarkSelector); 
  const chan: Channel<any> = yield call(evaluateInWorker, {
    mappedLandmarks, stepsBeingEvaluted, expectedLandmark,
  });
  try {
    // yield put({ type: Event.WORKER_STATUS_CHANGED, payload: { workerId, isBusy: true } });
    while (true) {
      const data = yield take(chan);
      console.log('Got worker data', data);
      yield put(data);
    }
  } catch (error) {
    console.error(error);
  } finally {
    chan.close();
  }
}

import {
  activeAnalysisStepsSelector,
  cephaloMapperSelector,
  getStepStateSelector,
} from '../selectors/workspace';

function* performAutomaticStepOnMainThread(): IterableIterator<Effect> {
  performance.mark('startAutomaticEvaluation');
  const steps: CephaloLandmark[] = yield select(activeAnalysisStepsSelector);
  const cephaloMapper: CephaloMapper = yield select(cephaloMapperSelector);
  const getStepState: (s: CephaloLandmark) => StepState = yield select(getStepStateSelector);
  const eligibleSteps = reject(steps, s => isManual(s) || getStepState(s) !== 'pending');
  for (const step of eligibleSteps) {
    console.info('Evaluationg step %s for automatic tracing', step.symbol);
    if (every(
      step.components,
      component => getStepState(component) === 'done',
    )) {
      console.log('Found step eligible for automatic evaluation', step.symbol);
      yield put({ type: Event.STEP_EVALUATION_STARTED, payload: step.symbol });
      const value = evaluate(step, cephaloMapper);
      if (value) {
        yield put(addLandmark(step.symbol, value));
        yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
        yield put(tryAutomaticSteps());
      } else {
        yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
      }
    } else {
      console.info('Step %s is not eligible for automatic tracing', step.symbol);
      // yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
    }
  };
  performance.mark('endAutomaticEvaluation');
  performance.measure('Evaluation on Main Thread', 'startAutomaticEvaluation', 'endAutomaticEvaluation');
}

function* watchSteps() {
  yield fork(takeEvery, Event.TRY_AUTOMATIC_STEPS_REQUESTED, performAutomaticStepOnMainThread);
  // yield fork(takeLatest, Event.TRY_AUTOMATIC_STEPS_REQUESTED, performAutomaticStepInWorker);
}

export default watchSteps;