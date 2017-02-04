import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

import without from 'lodash/without';
import omit from 'lodash/omit';

const KEY_STAGES_ORDER: StoreKey = 'treatment.stages.order';
const KEY_STAGES_DATA: StoreKey = 'treatment.stages.data';

const reducers: Partial<ReducerMap> = {
  [KEY_STAGES_ORDER]: handleActions<typeof KEY_STAGES_ORDER>({
    ADD_TREATMENT_STAGE: (state, { payload: { id } }) => [...state, id],
    REMOVE_TREATMENT_STAGE: (state, { payload: { id } }) => {
      return without(state, id);
    },
  }, []),
  [KEY_STAGES_DATA]: handleActions<typeof KEY_STAGES_DATA>({
    ADD_TREATMENT_STAGE: (state, { payload: { id, data } }) => {
      return {
        ...state,
        [id]: data,
      };
    },
    REMOVE_TREATMENT_STAGE: (state, { payload: { id } }) => {
      return omit(state, id) as typeof state;
    },
    UPDATE_TREATMENT_STAGE: (state, { payload: { id, update } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          ...update,
        },
      };
    },
  }, { }),
};

export default reducers;

export const getTreatmentStagesOrder = (state: StoreState) => state[KEY_STAGES_ORDER];
export const getTreatmentStagesData = (state: StoreState) => state[KEY_STAGES_DATA];

export const getTreatmentStageDataById = createSelector(
  getTreatmentStagesData,
  (data) => (stageId: string) => data[stageId],
);
