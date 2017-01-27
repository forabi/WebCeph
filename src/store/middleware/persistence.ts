import { Store, Middleware } from 'redux';
import idb from 'idb-keyval';

import {
  persistStateStarted,
  persistStateSucceeded,
  persistStateFailed,
  restorePersistedStateSucceeded,
  restorePersistedStateFailed,
  persistStateUpgradeStarted,
  clearPersistedStateSucceeded,
  clearPersistedStateFailed,
} from 'actions/persistence';

import pickBy from 'lodash/pickBy';
import indexOf from 'lodash/indexOf';

import { isActionOfType } from 'utils/store';

const PERSISTABLE_EVENTS: ActionType[] = [
  'BROWSER_COMPATIBLITY_CHECK_SUCCEEDED',
  'FETCH_ANALYSIS_SUCCEEDED',
];

const isPersistenceNeededForAction = ({ type }: GenericAction): boolean => {
  return indexOf(PERSISTABLE_EVENTS, type) > -1;
};

const PERSISTABLE_KEYS: StoreKey[] = [
  'app.status.isInstalled',
  'env.compat.isIgnored',
  'env.compat.results',
  'workspace.analyses.lastUsedId',
];

import requestIdleCallback from 'utils/requestIdleCallback';

const isStoreEntryPersistable = (key: string): boolean => {
  return indexOf(PERSISTABLE_KEYS, key) > -1;
};

const saveStateMiddleware: Middleware = ({ getState }: Store<StoreState>) => (next: GenericDispatch) =>
  async (action: GenericAction) => {
    if (isPersistenceNeededForAction(action)) {
      next(action);
      console.info(
        `Action ${action.type} has triggered state persistence`,
      );
      requestIdleCallback(async () => {
        try {
          next(persistStateStarted(void 0));
          console.info('Persisting state...');
          const stateToPersist = pickBy(
            getState(),
            (_, k) => isStoreEntryPersistable(k as string),
          );
          // @TODO: persist state along with app version
          await idb.set(__VERSION__, stateToPersist);
          console.info('State persisted successfully.');
          return next(persistStateSucceeded(void 0));
        } catch (e) {
          console.error(
            `Failed to persist state.`,
            e,
          );
          return next(persistStateFailed({ message: e.message }));
        }
      });
    } else {
      /**
       * Action does not trigger state
       * persistence, so it has been forwarded.
       */
      return next(action);
    }
  };

type RestoredState = { [id: string]: any };

const loadStateMiddleware: Middleware = (_: Store<StoreState>) => (next: GenericDispatch) =>
  async (action: GenericAction) => {
    if (isActionOfType(action, 'LOAD_PERSISTED_STATE_REQUESTED')) {
      console.info('Requested loading persisted state');
      next(action);
      try {
        const keys = await idb.keys();
        let restoredState: RestoredState = { };
        if (keys.length === 0) {
          console.info('No persisted state was found.');
        } else if (indexOf(keys, __VERSION__) > -1) {
          console.info(`Found persisted state compatible with this version (${__VERSION__})`);
          restoredState = await idb.get<RestoredState>(__VERSION__);
        } else {
          console.info(
            `Could not find persisted state compatible with this ` +
            `version (${__VERSION__}). Upgrading...`,
          );
          next(persistStateUpgradeStarted(void 0));
          // @TODO: perform any necessary upgrade operations
          await idb.clear(); // @FIXME: Workaround
          // @NOTE: Do not break on switch cases.
          switch (__VERSION__) {
            default:
              restoredState = { };
          }
        }
        console.info('Persisted state loaded successfully');
        return next(restorePersistedStateSucceeded(restoredState));
      } catch (e) {
        console.error(
          `Failed to load persisted state.`,
          e,
        );
        return next(restorePersistedStateFailed({ message: e.message }));
      }
    } else {
      return next(action);
    }
  };

const clearStateMiddleware: Middleware = (_: Store<StoreState>) => (next: GenericDispatch) =>
  async (action: GenericAction) => {
    if (isActionOfType(action, 'CLEAR_PRESISTED_STATE_SUCCEEDED')) {
      try {
        await idb.clear();
        return next(clearPersistedStateSucceeded(void 0));
      } catch (e) {
        console.error(
          `Failed to clean persisted state.`,
          e,
        );
        return next(clearPersistedStateFailed({ message: e.message }));
      }
    } else {
      return next(action);
    }
  };

export { saveStateMiddleware, clearStateMiddleware, loadStateMiddleware };
