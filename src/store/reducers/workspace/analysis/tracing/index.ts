import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import manualLandmarks, { getManualLandmarks } from './manualLandmarks';

type SkippedSteps = StoreEntries.workspace.analysis.tracing.steps.skipped;
type TracingMode = StoreEntries.workspace.analysis.tracing.mode;

const defaultTracingMode: TracingMode = 'assisted';

const KEY_TRACING_MODE = StoreKeys.tracingMode;
const KEY_SKIPPED_STEPS = StoreKeys.skippedSteps;

const tracingMode = handleActions<TracingMode, Payloads.setTracingMode>(
  {
    [Event.SET_TRACING_MODE_REQUESTED]: (state, { payload: mode, type }) => {
      if (mode === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return mode;
    },
  },
  defaultTracingMode,
);

const skippedSteps = handleActions<
  SkippedSteps,
  Payloads.skipStep | Payloads.unskipStep
>(
  {
    [Event.SKIP_MANUAL_STEP_REQUESTED]: (state, { payload: step, type }) => {
      if (step === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return assign({ }, state, { [step]: true });
    },
    [Event.UNSKIP_MANUAL_STEP_REQUESTED]: (state, { payload: step, type }) => {
      if (step === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return omit(state, step);
    },
  },
  { },
);

export default assign({
  [KEY_TRACING_MODE]: tracingMode,
  [KEY_SKIPPED_STEPS]: skippedSteps, 
}, manualLandmarks);

export const isLandmarkRemovable = createSelector(
  getManualLandmarks,
  (manualLandmarks) => (symbol: string) => manualLandmarks[symbol] !== undefined,
);

export { getManualLandmarks };
