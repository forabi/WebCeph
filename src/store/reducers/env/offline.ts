import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';

const KEY_IS_OFFLINE =  StoreKeys.connectionIsOffline;

type IsOffline = StoreEntries.env.connection.isOffline;

const isInitializedReducer = handleActions<
  IsOffline,
  Payloads.connectionStatusChanged
>({
  [Event.CONNECTION_STATUS_CHANGED]: (state, { payload }) => {
    if (payload === undefined) {
      return state;
    }
    return payload.isOffline || payload.isSlow || state;
  },
}, true);

export default {
  [KEY_IS_OFFLINE]: isInitializedReducer,
};

export const isAppOffline = (state: GenericState): IsOffline => state[KEY_IS_OFFLINE];
