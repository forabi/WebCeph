import { handleActions } from 'utils/store';

const KEY_PERSISTENCE_IS_SAVING: StoreKey = 'app.persistence.isSaving';
const KEY_PERSISTENCE_IS_LOADING: StoreKey = 'app.persistence.isLoading';
const KEY_PERSISTENCE_IS_UPGRADING: StoreKey = 'app.persistence.isUpgrading';
const KEY_PERSISTENCE_IS_READY: StoreKey = 'app.persistence.isReady';
const KEY_PERSISTENCE_LOAD_ERROR: StoreKey = 'app.persistence.load.error';
const KEY_PERSISTENCE_SAVE_ERROR: StoreKey = 'app.persistence.save.error';

const reducers: Partial<ReducerMap> = {
  [KEY_PERSISTENCE_IS_READY]: handleActions<typeof KEY_PERSISTENCE_IS_READY>({
    LOAD_PERSISTED_STATE_SUCCEEDED: (_, __) => true,
    LOAD_PERSISTED_STATE_FAILED: (_, __) => true,
  }, false),
  [KEY_PERSISTENCE_IS_SAVING]: handleActions<typeof KEY_PERSISTENCE_IS_SAVING>({
    PERSIST_STATE_STARTED: () => true,
    PERSIST_STATE_SUCCEEDED: () => false,
    PERSIST_STATE_FAILED: () => false,
  }, false),
  [KEY_PERSISTENCE_IS_LOADING]: handleActions<typeof KEY_PERSISTENCE_IS_LOADING>({
    LOAD_PERSISTED_STATE_REQUESTED: () => true,
    LOAD_PERSISTED_STATE_SUCCEEDED: () => false,
    LOAD_PERSISTED_STATE_FAILED: () => false,
  }, false),
  [KEY_PERSISTENCE_IS_UPGRADING]: handleActions<typeof KEY_PERSISTENCE_IS_UPGRADING>({
    PERSIST_STATE_UPGRADE_STARTED: () => true,
    LOAD_PERSISTED_STATE_SUCCEEDED: () => false,
    LOAD_PERSISTED_STATE_FAILED: () => false,
  }, false),
  [KEY_PERSISTENCE_LOAD_ERROR]: handleActions<typeof KEY_PERSISTENCE_LOAD_ERROR>({
    LOAD_PERSISTED_STATE_FAILED: (_, { payload }) => payload,
    LOAD_PERSISTED_STATE_SUCCEEDED: () => null,
  }, null),
  [KEY_PERSISTENCE_SAVE_ERROR]: handleActions<typeof KEY_PERSISTENCE_LOAD_ERROR>({
    PERSIST_STATE_FAILED: (_, { payload }) => payload,
    PERSIST_STATE_SUCCEEDED: () => null,
  }, null),
};

export default reducers;

export const isPersistedStateReady = (state: StoreState) => state[KEY_PERSISTENCE_IS_READY];
export const getPersistenceLoadError = (state: StoreState) => state[KEY_PERSISTENCE_LOAD_ERROR];

