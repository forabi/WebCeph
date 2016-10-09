import { Event } from '../../utils/constants';
import { takeEvery } from 'redux-saga';
import { put, fork, select, Effect } from 'redux-saga/effects';
import reject from 'lodash/reject';
import every from 'lodash/every';
import { isStepManual } from '../../analyses/helpers';

import { addManualLandmark, tryAutomaticSteps } from '../../actions/workspace';

import { evaluate } from '../../analyses/helpers';

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
  const eligibleSteps = reject(steps, s => isStepManual(s) || getStepState(s) !== 'pending');
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
        yield put(addManualLandmark(step.symbol, value));
        yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
        yield put(tryAutomaticSteps());
      } else {
        yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
      }
    } else {
      console.info('Step %s is not eligible for automatic tracing', step.symbol);
      yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
    }
  };
  performance.mark('endAutomaticEvaluation');
  performance.measure('Evaluation on Main Thread', 'startAutomaticEvaluation', 'endAutomaticEvaluation');
}

function* watchSteps() {
  yield fork(takeEvery, Event.TRY_AUTOMATIC_STEPS_REQUESTED, performAutomaticStepOnMainThread);
}

export default watchSteps;