import assign from 'lodash/assign';
import omit from 'lodash/omit';

import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultImageId } from 'utils/config';

import { getActiveTreatmentStageId } from 'store/reducers/workspace/treatmentStage';

import undoable, { includeAction } from 'redux-undo';
import { undoableConfig } from 'utils/config';

type ManualLandmarks = StoreEntries.workspace.tracing.manualLandmarks;

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;
const defaultState: ManualLandmarks = {
  [defaultImageId]: {

  },
};

const manualLandmarksReducer = handleActions<
  ManualLandmarks,
  Payloads.addManualLandmark | Payloads.removeManualLandmark
>(
  {
    [Event.ADD_MANUAL_LANDMARK_REQUESTED]: (
      state: ManualLandmarks, { type, payload }: Action<Payloads.addManualLandmark>
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
      state: ManualLandmarks,
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
          [imageId]: omit(state[imageId], symbol),
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

export const getManualLandmarksHistory = (state: GenericState): UndoableState<ManualLandmarks> => {
  return state[KEY_MANUAL_LANDMARKS];
};

export const getActiveStageManualLandmarks = createSelector(
  getManualLandmarksOfAllStages,
  getActiveTreatmentStageId,
  (manual, stageId): { [symbol: string]: GeometricalObject } => {
    if (manual[stageId] !== undefined) {
      return manual[stageId];
    }
    return { };
  },
);
