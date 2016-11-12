import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultImageId } from 'utils/config';

type State = StoreEntries.workspace.tracing.mode;

const defaultState: State = {
  [defaultImageId]: 'assisted',
};

const KEY_TRACING_MODE = StoreKeys.tracingMode;

const tracingModeReducer = handleActions<
  State,
  Payloads.setTracingMode
>(
  {
    [Event.SET_TRACING_MODE_REQUESTED]: (
      state: State,
      { payload, type }: Action<Payloads.setTracingMode>,
    ) => {
      return state;
    },
  },
  defaultState,
);

export default {
  [KEY_TRACING_MODE]: tracingModeReducer,
};
