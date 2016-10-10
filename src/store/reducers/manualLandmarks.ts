import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from '../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../utils/debug';

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;

const defaultState: StoreEntries.manualLandmarks = { };

export const manualLandmarksReducer = handleActions<StoreEntries.manualLandmarks, Payloads.addManualLandmark>({
  [Event.ADD_MANUAL_LANDMARK_REQUESTED]: (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
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
    return omit(state, payload.symbol) as StoreEntries.manualLandmarks;
  }
}, defaultState);

export default {
  [KEY_MANUAL_LANDMARKS]: manualLandmarksReducer,
};

export const manualLandmarksSelector = (state: { [id: string]: any }) => {
  return state[KEY_MANUAL_LANDMARKS] as StoreEntries.manualLandmarks;
};
