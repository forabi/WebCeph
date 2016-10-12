import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from '../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../utils/debug';

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;

const defaultState: StoreEntries.manualLandmarks = { };

const manualLandmarksReducer = handleActions<StoreEntries.manualLandmarks, Payloads.addManualLandmark>({
  [Event.ADD_MANUAL_LANDMARK_REQUESTED]: (state, { type, payload }) => {
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
  [Event.REMOVE_MANUAL_LANDMARK_REQUESTED]: (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (state[payload.symbol] === undefined) {
      __DEBUG__ && console.warn(
        'Attempted to remove a landmark that does not exist, this is a bug!'
      );
      return state;
    }
    return omit(state, payload.symbol) as StoreEntries.manualLandmarks;
  }
}, defaultState);


export default {
  [KEY_MANUAL_LANDMARKS]: manualLandmarksReducer,
};


export const manualLandmarksSelector = (state: GenericState) => {
  return state[KEY_MANUAL_LANDMARKS] as StoreEntries.manualLandmarks;
};
