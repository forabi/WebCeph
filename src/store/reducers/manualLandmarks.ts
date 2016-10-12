import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from '../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../utils/debug';
import undoable, { distinctState } from 'redux-undo';
import { createSelector } from 'reselect';

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
  [KEY_MANUAL_LANDMARKS]: undoable(manualLandmarksReducer, {
    undoType: Event.UNDO_REQUESTED,
    redoType: Event.REDO_REQUESTED,
    limit: 100,
    filter: distinctState(),
  }),
};

interface EnhancedState<T> {
  past: T[];
  present: T,
  future: T[];
}

export const manualLandmarksSelector = (state: GenericState) => {
  return state[KEY_MANUAL_LANDMARKS].present as StoreEntries.manualLandmarks;
};

export const manualLandmarkHistorySelector = (state: GenericState) => {
  return state[KEY_MANUAL_LANDMARKS] as EnhancedState<StoreEntries.manualLandmarks>;
};

export const canUndoSelector = createSelector(
  manualLandmarkHistorySelector,
  ({ past }) => past.length > 0,
);

export const canRedoSelector = createSelector(
  manualLandmarkHistorySelector,
  ({ future }) => future.length > 0,
);