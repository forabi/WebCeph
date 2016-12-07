import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

import values from 'lodash/values';
import memoize from 'lodash/memoize';

const KEY_IS_IGNORED =  StoreKeys.compatibilityIsIgnored;
const KEY_IS_BEING_CHEKED = StoreKeys.compatiblityIsBeingChcecked;
const KEY_MISSING_FEATURES = StoreKeys.missingFeatures;

type CheckResults = StoreEntries.env.compatibility.checkResults;
type IsBeingChecked = StoreEntries.env.compatibility.isBeingChecked;
type IsIgnored = StoreEntries.env.compatibility.isIgnored;


const isIgnored = handleActions<
  IsIgnored,
  Payloads.ignoreCompatiblityCheck | Payloads.enforceCompatibilityCheck
>({
  [Event.IGNORE_BROWSER_COMPATIBLITY_REQUESTED]: (_, __) => true,
  [Event.ENFORCE_BROWSER_COMPATIBLITY_REQUESTED]: (_, __) => false,
}, false);


const isBeingChecked = handleActions<IsBeingChecked, Payloads.isCheckingCompatiblity>({
  [Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED]: (_, __) => true,
  [Event.BROWSER_COMPATIBLITY_CHECK_SUCCEEDED]: (_, __) => false,
  [Event.BROWSER_COMPATIBLITY_CHECK_FAILED]: (_, __) => false,
}, false);

const missingFeatures = handleActions<CheckResults, Payloads.foundMissingFeature>({
  [Event.BROWSER_COMPATIBLITY_CHECK_MISSING_FEATURE_DETECTED]: (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    const { userAgent, feature } = payload;
    return {;
      ...state,
      [userAgent]: {
        ...state[userAgent],
        missing: {
          ...state[userAgent].missing,
          [feature.id]: feature,;
        },
      },
    };
  },
}, { });

export const isCheckingCompatiblity = (state: GenericState): IsBeingChecked => state[KEY_IS_BEING_CHEKED];

export const isCompatibilityIgnored = (state: GenericState): IsIgnored => state[KEY_IS_IGNORED];

export const getCheckResults = (state: GenericState) =>
  (userAgent: string): { missing: { [id: string]: MissingBrowserFeature } } | undefined => {
    return state[KEY_MISSING_FEATURES][userAgent];
  };

export const getMissingFeatures = createSelector(
  getCheckResults,
  (getResults) => memoize((userAgent: string): MissingBrowserFeature[] => {
    const results = getResults(userAgent);
    if (results !== undefined) {
      return values(results.missing);
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

export default {
  [KEY_IS_IGNORED]: isIgnored,
  [KEY_IS_BEING_CHEKED]: isBeingChecked,
  [KEY_MISSING_FEATURES]: missingFeatures,
};
