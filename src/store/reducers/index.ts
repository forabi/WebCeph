import { createSelector } from 'reselect';

import some from 'lodash/some';
import values from 'lodash/values';

import env from './env';
import workspace from './workspace';
import app from './app';
import persistence, {
  isPersistedStateReady,
  getPersistenceLoadError,
} from './persistence';
import locale, {
  getNegotiatedLocaleFetchError,
  isNegotiatedLocaleFetched,
} from './locale';

const reducers: ReducerMap = {
  ...workspace,
  ...persistence,
  ...app,
  ...env,
  ...app,
  ...locale,
};

export const isAppReady = createSelector(
  isPersistedStateReady,
  isNegotiatedLocaleFetched,
  (isPersisted, isFetched) => isPersisted && isFetched,
);

export const getAppInitializationErrors = createSelector(
  getNegotiatedLocaleFetchError,
  getPersistenceLoadError,
  (localeFetchError, persistenceLoadError) => ({
    localeFetchError,
    persistenceLoadError,
  }),
);

export const hasAppInitializationFailed = createSelector(
  getAppInitializationErrors,
  (errors) => some(values(errors), error => error !== null),
);


export default reducers;
