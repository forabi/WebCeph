import { handleActions } from 'utils/store';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';
import omit from 'lodash/omit';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';

const KEY_WORKERS: StoreKey = 'workspace.workers';

const workersReducer = handleActions<typeof KEY_WORKERS>(
  {
    WORKER_CREATED: (state, { payload, type }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const workerId = payload.id;
      if (workerId === undefined) {
        console.error(
          `Did not expect ${type} to be dispatched ` +
          `with payload that does not have an 'id' property. ` +
          `We do not know how to add this worker. ` +
          `Returning current state.`,
        );
        return state;
      }
      if (has(state, workerId)) {
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
      if (workerId === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (!has(state, workerId)) {
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
      if (patch === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const workerId = patch.id;
      if (workerId === undefined) {
        console.error(
          `Did not expect ${type} to be dispatched ` +
          `with payload that does not have an 'id' property. ` +
          `We do not know which worker to update. ` +
          `Returning current state.`,
        );
        return state;
      }
      if (workerId === undefined) {
        console.error(
          `Did not expect ${type} to be dispatched ` +
          `with a worker that has not been registered previously. ` +
          `Returning current state.`,
        );
        return state;
      }
      const w = state[workerId];
      return {
        ...state,
        [workerId]: { ...w, ...patch },
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
  }
);
