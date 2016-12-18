import { handleActions } from 'utils/store';

const KEY_IS_OFFLINE: StoreKey = 'env.connection.isOffline';

const reducers: Partial<ReducerMap> = {
  [KEY_IS_OFFLINE]: handleActions<typeof KEY_IS_OFFLINE>({
    CONNECTION_STATUS_CHANGED: (state, { payload }) => {
      if (payload.isOffline !== undefined) {
        return payload.isOffline;
      }
      return state;
    },
  }, true),
};

export default reducers;

export const isAppOffline = (state: StoreState) => state[KEY_IS_OFFLINE];
