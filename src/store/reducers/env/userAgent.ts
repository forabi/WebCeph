import { handleActions } from 'utils/store';

const KEY_USER_AGENT: StoreKey = 'env.userAgent';

const reducers: Partial<ReducerMap> = {
  [KEY_USER_AGENT]: handleActions<typeof KEY_USER_AGENT>({
    // @TODO
  }, navigator ? navigator.userAgent : null),
};

export default reducers;

export const getUserAgent = (state: StoreState) => state[KEY_USER_AGENT];
