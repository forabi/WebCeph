import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultImageId } from 'utils/config';

type State = StoreEntries.workspace.tracing.scaleFactor;

const defaultState: State = {
  [defaultImageId]: null,
};

const KEY_TRACING_SCALE_FACTOR = StoreKeys.tracingMode;

const scaleFactorReducer = handleActions<
  State,
  Payloads.setTracingMode |
  Payloads.addManualLandmark | Payloads.removeManualLandmark |
  Payloads.setScaleFactor | Payloads.unsetScaleFactor |
  Payloads.skipStep | Payloads.unskipStep
  >(
  {
    [Event.SET_SCALE_FACTOR_REQUESTED]: (
      state: State,
      { payload, type }: Action<Payloads.setScaleFactor>,
    ) => {
      return state;
    },
    [Event.UNSET_SCALE_FACTOR_REQUESTED]: (
      state: State,
      { payload, type }: Action<Payloads.unsetScaleFactor>,
    ) => {
      return state;
    },
  },
  defaultState,
);

export default {
  [KEY_TRACING_SCALE_FACTOR]: scaleFactorReducer,
};


export const getScaleFactor = (state: GenericState): State => state[KEY_TRACING_SCALE_FACTOR];
