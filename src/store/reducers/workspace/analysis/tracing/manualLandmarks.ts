import omit from 'lodash/omit';
import mapValues from 'lodash/mapValues';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

import undoable, { includeAction } from 'redux-undo';
import { undoableConfig } from 'utils/config';

type ManualLandmarks = StoreEntries.workspace.analysis.tracing.landmarks.manual;

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;
const defaultState: ManualLandmarks = { };

const manualLandmarksReducer = handleActions<
  ManualLandmarks,
  Payloads.addManualLandmark | Payloads.removeManualLandmark
>(
  {
    ADD_MANUAL_LANDMARK_REQUESTED: (
      state: ManualLandmarks, { type, payload }: Action<Payloads.addManualLandmark>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (state[payload.symbol] !== undefined) {
        console.warn(
          'Attempted to add a landmark that already exists, this is a bug!'
        );
        return state;
      }
      return {
        ...state,
        [payload.symbol]: mapValues(payload.value, Math.round),
      };
    },
    REMOVE_MANUAL_LANDMARK_REQUESTED: (
      state: ManualLandmarks,
      { type, payload: symbol }: Action<Payloads.removeManualLandmark>
    ) => {
      if (symbol === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (state[symbol] === undefined) {
        console.warn(
          'Attempted to remove a landmark that does not exist, this is a bug!'
        );
        return state;
      }
      return omit(state, symbol) as ManualLandmarks;
    },
    RESET_WORKSPACE_REQUESTED: () => defaultState,
  },
  defaultState,
);

export default {
  [KEY_MANUAL_LANDMARKS]: undoable(
    manualLandmarksReducer,
    {
      ...undoableConfig,
      filter: includeAction([
        Event.ADD_MANUAL_LANDMARK_REQUESTED,
        Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
      ]),
    },
  ),
};

export const getManualLandmarks = (state: StoreState) => {
  return state[KEY_MANUAL_LANDMARKS] as UndoableState<ManualLandmarks>;
};
