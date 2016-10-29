import assign from 'lodash/assign';
import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';
import toArray from 'lodash/toArray';

const KEY_IS_IGNORED =  StoreKeys.compatibilityIsIgnored;
const KEY_IS_BEING_CHEKED = StoreKeys.compatiblityIsBeingChcecked;
const KEY_MISSING_FEATURES = StoreKeys.missingFeatures;

type MissingFeatures = StoreEntries.env.compatibility.missingFeatures;
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

const missingFeatures = handleActions<MissingFeatures, Payloads.missingFeatureDetected>({
  [Event.BROWSER_COMPATIBLITY_CHECK_MISSING_FEATURE_DETECTED]: (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return assign({ }, state, {
      [payload.id]: payload,
    });
  }
}, { });

export const isCheckingCompatiblity = (state: GenericState): IsBeingChecked => state[KEY_IS_BEING_CHEKED];

export const getMissingFeatures = (state: GenericState) => toArray(state[KEY_MISSING_FEATURES] as MissingFeatures);

export const isBrowserCompatible = createSelector(
  getMissingFeatures,
  (missing) => missing.length === 0,
);

export default {
  [KEY_IS_IGNORED]: isIgnored,
  [KEY_IS_BEING_CHEKED]: isBeingChecked,
  [KEY_MISSING_FEATURES]: missingFeatures,
};