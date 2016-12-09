import { handleActions } from 'utils/store';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

import values from 'lodash/values';
import memoize from 'lodash/memoize';

const isIgnored = handleActions<'env.compat.isIgnored'>({
  IGNORE_BROWSER_COMPATIBLITY_REQUESTED: (_, __) => true,
  ENFORCE_BROWSER_COMPATIBLITY_REQUESTED: (_, __) => false,
}, false);

const isBeingChecked = handleActions<'env.compat.isBeingChecked'>({
  BROWSER_COMPATIBLITY_CHECK_REQUESTED: (_, __) => true,
  BROWSER_COMPATIBLITY_CHECK_SUCCEEDED: (_, __) => false,
  BROWSER_COMPATIBLITY_CHECK_FAILED: (_, __) => false,
}, false);

const missingFeatures = handleActions<'env.compat.results'>({
  MISSING_BROWSER_FEATURE_DETECTED: (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
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

export const isCheckingCompatiblity = (state: StoreState) => state['env.compat.isBeingChecked'];

export const isCompatibilityIgnored = (state: StoreState) => state['env.compat.isIgnored'];

export const getCheckResults = (state: StoreState) =>
  (userAgent: string) => {
    return state['env.compat.results'][userAgent];
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

const reducers: Partial<ReducerMap> = {
  'env.compat.isIgnored': isIgnored,
  'env.compat.isBeingChecked': isBeingChecked,
  'env.compat.results': missingFeatures,
};

export default reducers;
