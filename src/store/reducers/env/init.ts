import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';

const KEY_IS_INITIALIZED =  StoreKeys.appIsInitialized;

type IsInitialized = StoreEntries.env.init.isInitialized;

const isInitializedReducer = handleActions<
  IsInitialized,
  any
>({
  [Event.LOAD_PERSISTED_STATE_SUCCEEDED]: (_, __) => true,
  [Event.LOAD_PERSISTED_STATE_FAILED]: (_, __) => true,
}, false);

export default {
  [KEY_IS_INITIALIZED]: isInitializedReducer,
};

export const isAppInitialized = (state: StoreState): IsInitialized => state[KEY_IS_INITIALIZED];
