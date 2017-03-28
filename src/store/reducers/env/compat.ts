import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

import values from 'lodash/values';

const KEY_CHECK_STATUS: StoreKey = 'env.compat.check.status';
const KEY_IGNORED: StoreKey = 'env.compat.check.ignored';
const KEY_RESULTS: StoreKey = 'env.compat.check.results';

const checkStatus = handleActions<typeof KEY_CHECK_STATUS>({
  BROWSER_COMPATIBLITY_CHECK_REQUESTED: (state, { payload: { userAgent } }) => {
    return {
      ...state,
      [userAgent]: {
        ...state[userAgent],
        isChecking: true,
        error: null,
      },
    };
  },
  BROWSER_COMPATIBLITY_CHECK_SUCCEEDED: (state, { payload: { userAgent } }) => {
    return {
      ...state,
      [userAgent]: {
        ...state[userAgent],
        isChecking: false,
        error: null,
      },
    };
  },
  BROWSER_COMPATIBLITY_CHECK_FAILED: (state, { payload: { userAgent, error } }) => {
    return {
      ...state,
      [userAgent]: {
        ...state[userAgent],
        isChecking: false,
        error,
      },
    };
  },
}, { });

const isIgnored = handleActions<typeof KEY_IGNORED>({
  IGNORE_BROWSER_COMPATIBLITY_REQUESTED: (state, { payload: { userAgent } }) => {
    return {
      ...state,
      [userAgent]: true,
    };
  },
  ENFORCE_BROWSER_COMPATIBLITY_REQUESTED: (state, { payload: { userAgent } }) => {
    return {
      ...state,
      [userAgent]: false,
    };
  },
}, { });

const missingFeatures = handleActions<typeof KEY_RESULTS>({
  BROWSER_COMPATIBLITY_CHECK_REQUESTED: (state, { payload }) => {
    return {
      ...state,
      [payload.userAgent]: {
        missingFeatures: {

        },
      },
    };
  },
  MISSING_BROWSER_FEATURE_DETECTED: (state, { payload }) => {
    const { userAgent, feature } = payload;
    return {
      ...state,
      [userAgent]: {
        ...state[userAgent],
        missingFeatures: {
          ...state[userAgent].missingFeatures,
          [feature.id]: feature,
        },
      },
    };
  },
}, { });

const reducers: Partial<ReducerMap> = {
  [KEY_CHECK_STATUS]: checkStatus,
  [KEY_RESULTS]: missingFeatures,
  [KEY_IGNORED]: isIgnored,
};

export default reducers;

export const getCheckStatus = (state: StoreState) => state[KEY_CHECK_STATUS];
export const getIgnoreStatus = (state: StoreState) => state[KEY_IGNORED];

export const getCheckStatusForUserAgent = createSelector(
  getCheckStatus,
  (status) => (userAgent: string) => status[userAgent] || undefined,
);

export const getIgnoreStatusForUserAgent = createSelector(
  getIgnoreStatus,
  (status) => (userAgent: string) => status[userAgent] || undefined,
);

export const isCheckingCompatiblity = createSelector(
  getCheckStatusForUserAgent,
  (getStatus) => (userAgent: string) => {
    const status = getStatus(userAgent);
    if (status) {
      return status.isChecking;
    }
    return false;
  },
);

export const isCompatibilityIgnored = createSelector(
  getIgnoreStatusForUserAgent,
  (getStatus) => (userAgent: string) => {
    return getStatus(userAgent) || false;
  },
);

export const getCheckResultsForUserAgent = (state: StoreState) =>
  (userAgent: string) => {
    return state[KEY_RESULTS][userAgent];
  };

export const getMissingFeaturesForUserAgent = createSelector(
  getCheckResultsForUserAgent,
  (getResults) => (userAgent: string): MissingBrowserFeature[] => {
    const results = getResults(userAgent);
    if (results !== undefined) {
      return values(results.missingFeatures);
    }
    return [];
  },
);

export const isBrowserChecked = createSelector(
  isCheckingCompatiblity,
  getCheckResultsForUserAgent,
  (isChecking, getResults) => (userAgent: string) => {
    return !isChecking(userAgent) && getResults(userAgent) !== undefined;
  },
);

export const isBrowserCompatible = createSelector(
  isBrowserChecked,
  getMissingFeaturesForUserAgent,
  (isChecked, getMissing) => (userAgent: string) => {
    return isChecked(userAgent) && getMissing(userAgent).length === 0;
  },
);

