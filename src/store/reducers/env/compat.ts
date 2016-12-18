import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

import values from 'lodash/values';
import memoize from 'lodash/memoize';

const KEY_IS_IGNORED: StoreKey = 'env.compat.isIgnored';
const KEY_IS_BEING_CHECKED: StoreKey = 'env.compat.isBeingChecked';
const KEY_RESULTS: StoreKey = 'env.compat.results';

const isIgnored = handleActions<typeof KEY_IS_IGNORED>({
  IGNORE_BROWSER_COMPATIBLITY_REQUESTED: (_, __) => true,
  ENFORCE_BROWSER_COMPATIBLITY_REQUESTED: (_, __) => false,
}, false);

const isBeingChecked = handleActions<typeof KEY_IS_BEING_CHECKED>({
  BROWSER_COMPATIBLITY_CHECK_REQUESTED: (_, __) => true,
  BROWSER_COMPATIBLITY_CHECK_SUCCEEDED: (_, __) => false,
  BROWSER_COMPATIBLITY_CHECK_FAILED: (_, __) => false,
}, false);

const missingFeatures = handleActions<typeof KEY_RESULTS>({
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
  [KEY_IS_IGNORED]: isIgnored,
  [KEY_IS_BEING_CHECKED]: isBeingChecked,
  [KEY_RESULTS]: missingFeatures,
};

export default reducers;

export const isCheckingCompatiblity = (state: StoreState) => state[KEY_IS_BEING_CHECKED];

export const isCompatibilityIgnored = (state: StoreState) => state[KEY_IS_IGNORED];

export const getCheckResults = (state: StoreState) =>
  (userAgent: string) => {
    return state[KEY_RESULTS][userAgent];
  };

export const getMissingFeatures = createSelector(
  getCheckResults,
  (getResults) => memoize((userAgent: string): MissingBrowserFeature[] => {
    const results = getResults(userAgent);
    if (results !== undefined) {
      return values(results.missingFeatures);
    }
    return [];
  })
);

export const isBrowserChecked = createSelector(
  getCheckResults,
  (getResults) => (userAgent: string) => {
    return getResults(userAgent) !== undefined;
  },
);

export const isBrowserCompatible = createSelector(
  isCheckingCompatiblity,
  getMissingFeatures,
  (isChecking, getMissing) => (userAgent: string) => {
    return !isChecking && getMissing(userAgent).length === 0;
  },
);
