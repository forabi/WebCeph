import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';
import omit from 'lodash/omit';
import isEmpty from 'lodash/isEmpty';

const KEY_WORKERS: StoreKey = 'workers';

const workersReducer = handleActions<typeof KEY_WORKERS>(
  {
    WORKER_CREATED: (state, { payload, type }) => {
      const workerId = payload.id;
      if (typeof state[workerId] !== 'undefined') {
        console.error(
          `Did not expect ${type} to be dispatched ` +
          `with a worker that is already registered. ` +
          `Returning current state.`,
        );
        return state;
      }
      return { ...state, [workerId]: payload };
    },
    WORKER_TERMINATED: (state, { payload: workerId, type }) => {
      if (typeof state[workerId] === 'undefined') {
        console.error(
          `Did not expect ${type} to be dispatched ` +
          `with a worker that has not been registered previously. ` +
          `Returning current state.`,
        );
        return state;
      }
      return omit(state, workerId) as typeof state;
    },
    WORKER_STATUS_CHANGED: (state, { payload: patch, type }) => {
      const workerId = patch.id;
      if (typeof state[workerId] === 'undefined') {
        console.error(
          `Did not expect ${type} to be dispatched ` +
          `with a worker that has not been registered previously. ` +
          `Returning current state.`,
        );
        return state;
      }
      return {
        ...state,
        [workerId]: { ...state[workerId], ...patch },
      };
    },
  },
  { },
);

const reducers: Partial<ReducerMap> = {
  [KEY_WORKERS]: workersReducer,
};

export default reducers;

export const getWorkers = (state: StoreState) => state[KEY_WORKERS];

export const isPerformingBackgroundWork = (state: StoreState): boolean => {
  return !isEmpty(state[KEY_WORKERS]);
};

export const getWorkerDetails = createSelector(
  getWorkers,
  (workers) => (workerId: string): WorkerDetails => {
    return workers[workerId];
  },
);
