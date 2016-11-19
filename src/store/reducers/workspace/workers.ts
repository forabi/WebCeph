import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';
import omit from 'lodash/omit';
import has from 'lodash/has';
import isEmpty from 'lodash/isEmpty';

const KEY_WORKERS = StoreKeys.workers;

type Workers = StoreEntries.workspace.workers;

const defaultWorkers: Workers = { };

const workersReducer = handleActions<
  Workers,
  Payloads.addWorker | Payloads.removeWorker | Payloads.updateWorkerStatus
>(
  {
    [Event.WORKER_CREATED]: (state, action) => {
      const payload = action.payload as Payloads.addWorker | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      const workerId = payload.id;
      if (workerId === undefined) {
        console.error(
          `Did not expect ${action.type} to be dispatched ` +
          `with payload that does not have an 'id' property. ` +
          `We do not know how to add this worker. ` +
          `Returning current state.`,
        );
        return state;
      }
      if (has(state, workerId)) {
        console.error(
          `Did not expect ${action.type} to be dispatched ` +
          `with a worker that is already registered. ` +
          `Returning current state.`,
        );
        return state;
      }
      return { ...state, [workerId]: payload };
    },
    [Event.WORKER_TERMINATED]: (state, action) => {
      const workerId = action.payload as Payloads.removeWorker | undefined;
      if (workerId === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      if (!has(state, workerId)) {
        console.error(
          `Did not expect ${action.type} to be dispatched ` +
          `with a worker that has not been registered previously. ` +
          `Returning current state.`,
        );
        return state;
      }
      return omit(state, workerId) as Workers;
    },
    [Event.WORKER_STATUS_CHANGED]: (state, action) => {
      const patch = action.payload as Payloads.updateWorkerStatus | undefined;
      if (patch === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      const workerId = patch.id;
      if (workerId === undefined) {
        console.error(
          `Did not expect ${action.type} to be dispatched ` +
          `with payload that does not have an 'id' property. ` +
          `We do not know which worker to update. ` +
          `Returning current state.`,
        );
        return state;
      }
      if (workerId === undefined) {
        console.error(
          `Did not expect ${action.type} to be dispatched ` +
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
  defaultWorkers,
);

export default {
  [KEY_WORKERS]: workersReducer,
};

export const getWorkers = (state: GenericState): Workers => {
  return state[KEY_WORKERS];
};

export const isPerformingBackgroundWork = (state: GenericState): boolean => {
  return !isEmpty(state[KEY_WORKERS]);
};

export const getWorkerDetails = createSelector(
  getWorkers,
  (workers) => (workerId: string): WorkerDetails => {
    return workers[workerId];
  }
);
