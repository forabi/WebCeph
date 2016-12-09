import { handleActions } from 'utils/store';

const KEY_IS_INITIALIZED: StoreKey = 'app.init.isInitialized';

const isInitializedReducer = handleActions<typeof KEY_IS_INITIALIZED>({
  LOAD_PERSISTED_STATE_SUCCEEDED: (_, __) => true,
  LOAD_PERSISTED_STATE_FAILED: (_, __) => true,
}, false);

const reducers: Partial<ReducerMap> = {
  [KEY_IS_INITIALIZED]: isInitializedReducer,
};

export default reducers;

export const isAppInitialized = (state: StoreState) => state[KEY_IS_INITIALIZED];
