import { Event, StoreKeys } from 'utils/constants';
import { Store, Middleware } from 'redux';
import idb from 'idb-keyval';
import has from 'lodash/has';

import {
  persistStateStarted,
  persistStateSucceeded,
  persistStateFailed,
  restorePersistedStateSucceeded,
  restorePersistedStateFailed,
  clearPersistedStateSucceeded,
  clearPersistedStateFailed,
} from 'actions/persistence';

import pickBy from 'lodash/pickBy';
import find from 'lodash/find';

const PERSISTABLE_EVENTS = [
  Event.BROWSER_COMPATIBLITY_CHECK_SUCCEEDED,
  Event.SET_ANALYSIS_SUCCEEDED,
];

const isPersistenceNeededForAction = ({ type }: Action<any>): boolean => {
  return Boolean(find(PERSISTABLE_EVENTS, type));
};

const PERSISTABLE_KEYS = [
  StoreKeys.appCachingComplete,
  StoreKeys.compatibilityIsIgnored,
  StoreKeys.missingFeatures,
  StoreKeys.activeAnalysisId,
];

const isStoreEntryPersistable = (key: string): boolean => {
  return Boolean(find(PERSISTABLE_KEYS, key));
};

const saveStateMiddleware: Middleware = ({ getState }: Store<any>) => (next: DispatchFunction) =>
  async (action: Action<any>) => {
    if (isPersistenceNeededForAction(action)) {
      next(action);
      try {
        next(persistStateStarted());
        const stateToPersist = pickBy(
          getState(),
          (_, k) => isStoreEntryPersistable(k as string),
        );
        // @TODO: persist state along with app version
        await idb.set(__VERSION__, stateToPersist);
        return next(persistStateSucceeded());
      } catch (e) {
        console.error(
          `Failed to persist state.`,
          e,
        );
        return next(persistStateFailed({ message: e.message }));
      }
    } else {
      return next(action);
    }
  };

const loadStateMiddleware: Middleware = (_: Store<any>) => (next: DispatchFunction) =>
  async (action: Action<any>) => {
    const { type } = action;
    if (type === Event.LOAD_PERSISTED_STATE_REQUESTED) {
      next(action);
      try {
        const keys = await idb.keys();
        type RestoredState = { [id: string]: any };
        let restoredState: RestoredState;
        if (has(keys, __VERSION__)) {
          restoredState = await idb.get<RestoredState>(__VERSION__);
        } else {
          // @TODO: perform any necessary upgrade operations
          // @NOTE: Do not break on switch cases.
          switch (__VERSION__) {
            default:
              restoredState = { };
          }
        }
        return next(restorePersistedStateSucceeded(restoredState));
      } catch (e) {
        console.error(
          `Failed to load state.`,
          e,
        );
        return next(restorePersistedStateFailed({ message: e.message }));
      }
    } else {
      return next(action);
    }
  };

const clearStateMiddleware: Middleware = (_: Store<any>) => (next: DispatchFunction) =>
  async (action: Action<any>) => {
    if (action.type === Event.CLEAR_PRESISTED_STATE_SUCCEEDED) {
      try {
        await idb.clear();
        return next(clearPersistedStateSucceeded());
      } catch (e) {
        console.error(
          `Failed to persist state.`,
          e,
        );
        return next(clearPersistedStateFailed({ message: e.message }));
      }
    } else {
      return next(action);
    }
  };

export { saveStateMiddleware, clearStateMiddleware, loadStateMiddleware };
