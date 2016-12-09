import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

const KEY_IS_OFFLINE =  StoreKeys.connectionIsOffline;

type IsOffline = StoreEntries.env.connection.isOffline;

const isOfflineReducer = handleActions<
  IsOffline,
  Payloads.connectionStatusChanged
>({
  [Event.CONNECTION_STATUS_CHANGED]: (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return payload.isOffline !== undefined ? payload.isOffline : state;
  },
}, true);

export default {
  [KEY_IS_OFFLINE]: isOfflineReducer,
};

export const isAppOffline = (state: StoreState): IsOffline => state[KEY_IS_OFFLINE];
