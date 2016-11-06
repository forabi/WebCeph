import { createSelector } from 'reselect';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultTreatmentStageId, defaultTreatmentStageDisplayName } from 'utils/config';

import { getActiveImageId } from 'store/reducers/workspace/image';

import assign from 'lodash/assign';
import map from 'lodash/map';
import without from 'lodash/without';
import omit from 'lodash/omit';
import findKey from 'lodash/findKey';

type TreatmentStagesOrder = StoreEntries.workspace.treatmentStages.order;
type TreatmentStagesDetails = StoreEntries.workspace.treatmentStages.data;

const defaultTreatmentStagesOrder: TreatmentStagesOrder = [defaultTreatmentStageId];
const defaultTreatmentStagesDetails: TreatmentStagesDetails = {
  [defaultTreatmentStageId]: {
    id: defaultTreatmentStageId,
    displayName: defaultTreatmentStageDisplayName,
    imageIds: { },
  },
};

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
      return omit(state, payload) as TreatmentStagesDetails;
    },
  },
  defaultTreatmentStagesDetails,
);

const KEY_TREATMENT_STAGES_ORDER = StoreKeys.treatmentStagesOrder;
const KEY_TREATMENT_STAGES_DETAILS = StoreKeys.treatmentStagesDetails;

export default {
  [KEY_TREATMENT_STAGES_ORDER]: treatmentStagesOrderReducer,
  [KEY_TREATMENT_STAGES_DETAILS]: treatmentStagesDetailsReducer,
};

export const getTreatmentStagesDetails =
  (state: GenericState): TreatmentStagesDetails => state[KEY_TREATMENT_STAGES_DETAILS];

export const getActiveTreatmentStageId = createSelector(
  getActiveImageId,
  getTreatmentStagesDetails,
  (activeImageId, details) => findKey<TreatmentStage, TreatmentStagesDetails>(
    details,
    d => d.imageIds[activeImageId] === true,
  ),
);

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
