import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultTreatmentStageId, defaultTreatmentStageDisplayName } from 'utils/config';

import assign from 'lodash/assign';
import map from 'lodash/map';
import without from 'lodash/without';
import omit from 'lodash/omit';

type TreatmentStageId = StoreEntries.workspace.activeTreatmentStageId;
type TreatmentStagesOrder = StoreEntries.workspace.treatmentStagesOrder;
type TreatmentStagesDetails = StoreEntries.workspace.treatmentStagesDetails;

const defaultTreatmentStagesOrder: TreatmentStagesOrder = [defaultTreatmentStageId];
const defaultTreatmentStagesDetails: TreatmentStagesDetails = {
  [defaultTreatmentStageId]: {
    id: defaultTreatmentStageId,
    displayName: defaultTreatmentStageDisplayName,
  },
};

const getActiveTreatmentStageIdReducer = handleActions<TreatmentStageId, Payloads.setActiveTracingStage>(
  {
    [Event.SET_ACTIVE_TRACING_STAGE]: (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload as TreatmentStageId;
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultTreatmentStageId,
  },
  defaultTreatmentStageId,
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

const KEY_ACTIVE_TREATMENT_STAGE_ID = StoreKeys.activeTracingStageId;
const KEY_TREATMENT_STAGES_ORDER = StoreKeys.treatmentStagesOrder;
const KEY_TREATMENT_STAGES_DETAILS = StoreKeys.treatmentStagesDetails;

export default {
  [KEY_ACTIVE_TREATMENT_STAGE_ID]: getActiveTreatmentStageIdReducer,
  [KEY_TREATMENT_STAGES_ORDER]: treatmentStagesOrderReducer,
  [KEY_TREATMENT_STAGES_DETAILS]: treatmentStagesDetailsReducer,
};

export const getActiveImageId =
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
  getActiveImageId,
  getTreatmentStagesDetails,
  (id, details) => details[id],
);
