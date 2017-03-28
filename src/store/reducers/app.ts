import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

const KEY_IS_UPDATING: StoreKey = 'app.status.isUpdating';
const KEY_IS_INSTALLING: StoreKey = 'app.status.isInstalling';
const KEY_IS_INSTALLED: StoreKey = 'app.status.isInstalled';
const KEY_IS_UPDATED: StoreKey = 'app.status.isUpdated';

const reducers: Partial<ReducerMap> = {
  [KEY_IS_UPDATING]: handleActions<typeof KEY_IS_UPDATING>({
    APP_UPDATE_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete !== true && payload.error !== null;
    },
  }, false),
  [KEY_IS_INSTALLING]: handleActions<typeof KEY_IS_INSTALLING>({
    APP_INSTALL_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete !== true && payload.error !== null;
    },
  }, false),
  [KEY_IS_INSTALLED]: handleActions<typeof KEY_IS_INSTALLED>({
    APP_INSTALL_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete === true && payload.error === null;
    },
  }, false),
  [KEY_IS_UPDATED]: handleActions<typeof KEY_IS_UPDATING>({
    APP_UPDATE_STATUS_CHANGED: (_, { payload }) => {
      return payload.complete === true && payload.error === null;
    },
  }, false),
};

export default reducers;

export const isAppUpdating = (state: StoreState) => state[KEY_IS_UPDATING];
export const isAppInstalling = (state: StoreState) => state[KEY_IS_INSTALLING];
export const isAppCaching = createSelector(
  isAppInstalling,
  isAppUpdating,
  (isCaching, isUpdating) => isCaching || isUpdating,
);

export const isAppInstalled = (state: StoreState) => state[KEY_IS_INSTALLED];
export const isAppUpdated = (state: StoreState) => state[KEY_IS_UPDATED];
