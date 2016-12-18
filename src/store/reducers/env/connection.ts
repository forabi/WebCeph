import { handleActions } from 'utils/store';
import { printUnexpectedPayloadWarning } from 'utils/debug';

const KEY_IS_OFFLINE: StoreKey = 'env.connection.isOffline';

const reducers: Partial<ReducerMap> = {
  [KEY_IS_OFFLINE]: handleActions<typeof KEY_IS_OFFLINE>({
    CONNECTION_STATUS_CHANGED: (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload.isOffline !== undefined ? payload.isOffline : state;
    },
  }, true),
};

export default reducers;

export const isAppOffline = (state: StoreState) => state[KEY_IS_OFFLINE];
