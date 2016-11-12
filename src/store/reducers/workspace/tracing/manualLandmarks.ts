import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultImageId } from 'utils/config';

import undoable, { includeAction } from 'redux-undo';
import { undoableConfig } from 'utils/config';

type State = StoreEntries.workspace.tracing.manualLandmarks;

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;
const defaultState: State = {
  [defaultImageId]: {

  },
};

const manualLandmarksReducer = handleActions<
  State,
  Payloads.addManualLandmark | Payloads.removeManualLandmark
>(
  {
    [Event.ADD_MANUAL_LANDMARK_REQUESTED]: (
      state: State, { type, payload }: Action<Payloads.addManualLandmark>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { symbol, value, imageId } = payload;
      if (state[imageId] === undefined) {
        console.warn(
          'Attempted to add a landmark on an image that does not exist, this is a bug!'
        );
        return state;
      }
      if (state[imageId][symbol] !== undefined) {
        console.warn(
          'Attempted to add a landmark that already exists, this is a bug!'
        );
        return state;
      }
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              [symbol]: value,
            },
          ),
        },
      );
    },
    [Event.REMOVE_MANUAL_LANDMARK_REQUESTED]: (
      state: State,
      { type, payload }: Action<Payloads.removeManualLandmark>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { symbol, imageId } = payload;
      if (imageId === undefined) {
        console.warn(
          'Attempted to remove a landmark on an image that does not exist, this is a bug!'
        );
        return state;
      }
      if (state[imageId][symbol] === undefined) {
        console.warn(
          'Attempted to remove a landmark that does not exist, this is a bug!'
        );
        return state;
      }
      return assign(
        { },
        state,
        {
          [imageId]: omit(state, symbol),
        },
      );
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultState,
  },
  defaultState,
);

export default {
  [KEY_MANUAL_LANDMARKS]: undoable(
    manualLandmarksReducer,
    assign(
      { },
      undoableConfig,
      {
        filter: includeAction([
          Event.ADD_MANUAL_LANDMARK_REQUESTED,
          Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
        ]),
      },
    ),
  ),
};

export const getManualLandmarks = (state: GenericState) => {
  return state[KEY_MANUAL_LANDMARKS] as UndoableState<State>;
};
