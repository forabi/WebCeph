import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultImageId } from 'utils/config';

type State = StoreEntries.workspace.tracing.skippedSteps;

const defaultState: State = {
  [defaultImageId]: {

  },
};

const KEY_TRACING_SKIPPED = StoreKeys.skippedSteps;

const skippedStepsReducer = handleActions<
  State,
  Payloads.skipStep | Payloads.unskipStep
  >(
  {
    [Event.SKIP_MANUAL_STEP_REQUESTED]: (
      state: State,
      { payload, type }: Action<Payloads.skipStep>,
    ) => {
      return state;
    },
    [Event.UNSKIP_MANUAL_STEP_REQUESTED]: (
      state: State,
      { payload, type }: Action<Payloads.unskipStep>,
    ) => {
      return state;
    },
  },
  defaultState,
);

export default {
  [KEY_TRACING_SKIPPED]: skippedStepsReducer,
};
