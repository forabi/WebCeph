declare var self: DedicatedWorkerGlobalScope;
import reject from 'lodash/reject';
import every from 'lodash/every';
import has from 'lodash/has';

import { evaluate, getStepsForAnalysis } from '../analyses/helpers';
import { addManualLandmark, tryAutomaticSteps } from '../actions/workspace';
import { Event } from '../utils/constants';

const isManual = (step: CephaloLandmark) => step.type === 'point';

import common from '../analyses/common';
const steps: CephaloLandmark[] = getStepsForAnalysis(common);
const getCephaloMapper = (mappedLandmarks: { [id: string]: GeometricalObject }) => {
  const toPoint = (cephaloPoint: CephaloPoint) => {
    return mappedLandmarks[cephaloPoint.symbol] as GeometricalPoint;
  };
  const toLine = (cephaloLine: CephaloLine) => {
    const A = toPoint(cephaloLine.components[0]);
    const B = toPoint(cephaloLine.components[1]);
    return {
      x1: A.x,
      y1: A.y,
      x2: B.x,
      y2: B.y,
    }
  };
  // @TODO: Handle scale factor
  return { toPoint, toLine, scaleFactor: 1 / 3.2 };
}

const getStepStateSelector = (stepsBeingEvaluated, mappedLandmarks, expectedLandmark) => (landmark: CephaloLandmark): StepState => {
  if (has(mappedLandmarks, landmark.symbol)) {
    return 'done';
  } else if (has(stepsBeingEvaluated, landmark.symbol)) {
    return 'evaluating';
  } else if (expectedLandmark && expectedLandmark.symbol === landmark.symbol) {
    return 'current';
  } else {
    return 'pending';
  }
};

self.addEventListener('message', ({ data }) => {
  const { mappedLandmarks, stepsBeingEvaluted, expectedLandmark } = data;
  const getStepState = getStepStateSelector(stepsBeingEvaluted, mappedLandmarks, expectedLandmark);
  const cephaloMapper: CephaloMapper = getCephaloMapper(mappedLandmarks);
  const eligibleSteps = reject(steps, s => isManual(s) || getStepState(s) !== 'pending');
  for (const step of eligibleSteps) {
    console.info('Evaluationg step %s for automatic tracing', step.symbol);
    if (every(
      step.components,
      component => getStepState(component) === 'done',
    )) {
      console.log('Found step eligible for automatic evaluation', step.symbol);
      const value = evaluate(step, cephaloMapper);
      if (value) {
        postMessage(addManualLandmark(step.symbol, value));
        postMessage({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
        postMessage(tryAutomaticSteps());
      } else {
        postMessage({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
      }
    } else {
      console.info('Step %s is not eligible for automatic tracing', step.symbol);
      // yield put({ type: Event.STEP_EVALUATION_FINISHED, payload: step.symbol });
      self.postMessage('END');
    }
  };
});
