import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, reduceReducers } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

type ManualLandmarks = StoreEntries.workspace.analysis.tracing.landmarks.manual;

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;
const defaultState: ManualLandmarks = { };

const addLandmark = handleAction<ManualLandmarks, Payloads.addManualLandmark>(
  Event.ADD_MANUAL_LANDMARK_REQUESTED,
  (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (state[payload.symbol] !== undefined) {
      __DEBUG__ && console.warn(
        'Attempted to add a landmark that already exists, this is a bug!'
      );
      return state;
    }
    return assign(
      { },
      state,
      {
        [payload.symbol]: payload.value,
      },
    );
  },
);

const removeLandmark = handleAction<ManualLandmarks, Payloads.removeManualLandmark>(
  Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
  (state, { type, payload: symbol }) => {
    if (symbol === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (state[symbol] === undefined) {
      __DEBUG__ && console.warn(
        'Attempted to remove a landmark that does not exist, this is a bug!'
      );
      return state;
    }
    return omit(state, symbol) as ManualLandmarks;
  },
);

const manualLandmarksReducer = wrapWithDefaultState(
  reduceReducers<ManualLandmarks, GenericAction>(addLandmark, removeLandmark),
  defaultState,
);

export default {
  [KEY_MANUAL_LANDMARKS]: manualLandmarksReducer,
};

export const getManualLandmarks = (state: GenericState) => {
  return state[KEY_MANUAL_LANDMARKS] as ManualLandmarks;
};
