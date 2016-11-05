import assign from 'lodash/assign';
import omit from 'lodash/omit';
import without from 'lodash/without';
import map from 'lodash/map';

import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

import undoable, { includeAction } from 'redux-undo';
import { undoableConfig } from 'utils/config';

type ManualLandmarks = StoreEntries.workspace.analysis.tracing.landmarks.manual;
type TreatmentStageId = StoreEntries.workspace.analysis.activeTreatmentStageId;
type TreatmentStagesOrder = StoreEntries.workspace.analysis.treatmentStagesOrder;
type TreatmentStagesDetails = StoreEntries.workspace.analysis.treatmentStagesDetails;

const KEY_MANUAL_LANDMARKS = StoreKeys.manualLandmarks;
const KEY_ACTIVE_TREATMENT_STAGE_ID = StoreKeys.activeTracingStageId;
const KEY_TREATMENT_STAGES_ORDER = StoreKeys.treatmentStagesOrder;
const KEY_TREATMENT_STAGES_DETAILS = StoreKeys.treatmentStagesDetails;

const defaultState: ManualLandmarks = { };
const defaultTracingStageId: TreatmentStageId = null;
const defaultTreatmentStagesOrder: TreatmentStagesOrder = [];
const defaultTreatmentStagesDetails: TreatmentStagesDetails = { };

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

      if (state[payload.stage] === undefined) {
        console.warn(
          'Attempted to add a landmark without specifing the treatment stage, this is a bug!'
        );
        return state;
      }

      if (state[payload.symbol] !== undefined) {
        console.warn(
          'Attempted to add a landmark that already exists, this is a bug!'
        );
        return state;
      }
      return assign(
        { },
        state,
        {
          [payload.stage]: assign(
            { },
            state[payload.stage],
            {
              [payload.symbol]: payload.value,
            },
          ),
        }
      );
    },
    [Event.REMOVE_MANUAL_LANDMARK_REQUESTED]: (
      state: ManualLandmarks,
      { type, payload: { stage, symbol } }: Action<Payloads.removeManualLandmark>
    ) => {
      if (symbol === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (stage === undefined) {
        console.warn(
          'Attempted to remove a landmark without specifing the treatment stage, this is a bug!'
        );
        return state;
      }
      if (state[stage][symbol] === undefined) {
        console.warn(
          'Attempted to remove a landmark that does not exist, this is a bug!'
        );
        return state;
      }
      return assign(
        { },
        state,
        {
          [stage]: omit(state[stage], symbol),
        },
      );
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultState,
  },
  defaultState,
);

const getActiveTracingStageIdReducer = handleActions<TreatmentStageId, Payloads.setActiveTracingStage>(
  {
    [Event.SET_ACTIVE_TRACING_STAGE]: (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload as TreatmentStageId;
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultTracingStageId,
  },
  defaultTracingStageId,
);


const treatmentStagesOrderReducer = handleActions<
  TreatmentStagesOrder,
  Payloads.addTreatmentStage | Payloads.removeTreatmentStage
>(
  {
    [Event.ADD_TREATMENT_STAGE]: (
      state: TreatmentStagesOrder,
      { type, payload }: Action<Payloads.addTreatmentStage>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return [
        payload.id,
        ...state,
      ];
    },
    [Event.REMOVE_TREATMENT_STAGE]: (
      state: TreatmentStagesOrder,
      { type, payload }: Action<Payloads.removeTreatmentStage>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return without(state, payload);
    },
  },
  defaultTreatmentStagesOrder,
);

const treatmentStagesDetailsReducer = handleActions<
  TreatmentStagesDetails,
  Payloads.addTreatmentStage | Payloads.removeTreatmentStage
>(
  {
    [Event.ADD_TREATMENT_STAGE]: (
      state: TreatmentStagesDetails,
      { type, payload }: Action<Payloads.addTreatmentStage>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return assign(
        { },
        state,
        {
          [payload.id]: payload,
        },
      );
    },
    [Event.REMOVE_TREATMENT_STAGE]: (
      state: TreatmentStagesDetails,
      { type, payload }: Action<Payloads.removeTreatmentStage>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return omit(state, payload);
    },
  },
  defaultTreatmentStagesDetails,
);

export default {
  [KEY_ACTIVE_TREATMENT_STAGE_ID]: getActiveTracingStageIdReducer,
  [KEY_TREATMENT_STAGES_ORDER]: treatmentStagesOrderReducer,
  [KEY_TREATMENT_STAGES_DETAILS]: treatmentStagesDetailsReducer,
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

export const getActiveTreatmentStageId =
  (state: GenericState): TreatmentStageId => state[KEY_ACTIVE_TREATMENT_STAGE_ID];

export const getTreatmentStagesDetails =
  (state: GenericState): TreatmentStagesDetails => state[KEY_TREATMENT_STAGES_DETAILS];

export const getTreatmentStagesOrder =
  (state: GenericState): TreatmentStagesOrder => state[KEY_TREATMENT_STAGES_ORDER];

export const getTreatmentStagesIdsInOrder = createSelector(
  getTreatmentStagesOrder,
  getTreatmentStagesDetails,
  (ids, details) => map(ids, id => details[id]),
);

export const getActiveTreatmentStageDetails = createSelector(
  getActiveTreatmentStageId,
  getTreatmentStagesDetails,
  (id, details) => details[id],
);

export const getManualLandmarksHistory = (state: GenericState): UndoableState<ManualLandmarks> => {
  return state[KEY_MANUAL_LANDMARKS];
};

export const getManualLandmarksOfAllStages = (state: GenericState): ManualLandmarks => {
  return state[KEY_MANUAL_LANDMARKS].present;
};

export const getActiveStageManualLandmarks = createSelector(
  getManualLandmarksOfAllStages,
  getActiveTreatmentStageId,
  (manual, stageId): { [symbol: string]: GeometricalObject } => {
    if (stageId !== null && manual[stageId] !== undefined) {
      return manual[stageId];
    }
    return { };
  },
);
