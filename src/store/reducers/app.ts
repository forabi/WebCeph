import { handleActions } from 'utils/store';

const KEY_IS_INITIALIZED: StoreKey = 'app.init.isInitialized';
const KEY_IS_UPDATING: StoreKey = 'app.status.isUpdating';
const KEY_IS_CACHING: StoreKey = 'app.status.isCaching';
const KEY_IS_CACHED: StoreKey = 'app.status.isCached';
const PERSISTENCE_IS_SAVING: StoreKey = 'app.persistence.isSaving';
const PERSISTENCE_IS_LOADING: StoreKey = 'app.persistence.isLoading';
const PERSISTENCE_IS_UPGRADING: StoreKey = 'app.persistence.isUpgrading';
const PERSISTENCE_LOAD_ERROR: StoreKey = 'app.persistence.load.error';
const PERSISTENCE_SAVE_ERROR: StoreKey = 'app.persistence.save.error';

const reducers: Partial<ReducerMap> = {
  [KEY_IS_INITIALIZED]: handleActions<typeof KEY_IS_INITIALIZED>({
    LOAD_PERSISTED_STATE_SUCCEEDED: (_, __) => true,
    LOAD_PERSISTED_STATE_FAILED: (_, __) => true,
  }, false),
  [KEY_IS_UPDATING]: handleActions<typeof KEY_IS_UPDATING>({
    // @TODO: handle updates differently
    APP_CACHING_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete !== true && payload.error !== null;
    },
  }, false),
  [KEY_IS_CACHING]: handleActions<typeof KEY_IS_CACHING>({
    APP_CACHING_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete !== true && payload.error !== null;
    },
  }, false),
  [KEY_IS_CACHED]: handleActions<typeof KEY_IS_CACHED>({
    APP_CACHING_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete === true && payload.error !== null;
    },
  }, false),
  [PERSISTENCE_IS_SAVING]: handleActions<typeof PERSISTENCE_IS_SAVING>({
    PERSIST_STATE_STARTED: () => true,
    PERSIST_STATE_SUCCEEDED: () => false,
    PERSIST_STATE_FAILED: () => false,
  }, false),
  [PERSISTENCE_IS_LOADING]: handleActions<typeof PERSISTENCE_IS_LOADING>({
    LOAD_PERSISTED_STATE_REQUESTED: () => true,
    LOAD_PERSISTED_STATE_SUCCEEDED: () => false,
    LOAD_PERSISTED_STATE_FAILED: () => false,
  }, false),
  [PERSISTENCE_IS_UPGRADING]: handleActions<typeof PERSISTENCE_IS_UPGRADING>({
    PERSIST_STATE_UPGRADE_STARTED: () => true,
    LOAD_PERSISTED_STATE_SUCCEEDED: () => false,
    LOAD_PERSISTED_STATE_FAILED: () => false,
  }, false),
  [PERSISTENCE_LOAD_ERROR]: handleActions<typeof PERSISTENCE_LOAD_ERROR>({
    LOAD_PERSISTED_STATE_FAILED: (_, { payload }) => payload,
    LOAD_PERSISTED_STATE_SUCCEEDED: () => null,
  }, null),
  [PERSISTENCE_SAVE_ERROR]: handleActions<typeof PERSISTENCE_LOAD_ERROR>({
    PERSIST_STATE_FAILED: (_, { payload }) => payload,
    PERSIST_STATE_SUCCEEDED: () => null,
  }, null),
};

export default reducers;

export const isAppInitialized = (state: StoreState) => state[KEY_IS_INITIALIZED];
