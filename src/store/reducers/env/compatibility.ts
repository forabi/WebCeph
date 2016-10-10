import assign from 'lodash/assign';
import { handleActions } from 'redux-actions';
import { Event } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';
import { createSelector } from 'reselect';
import toArray from 'lodash/toArray';

export const KEY_IS_IGNORED =  'env.compatiblity.isIgnored';
export const KEY_IS_BEING_CHEKED = 'env.compatiblity.isBeingChecked';
export const KEY_MISSING_FEATURES = 'env.compatiblity.missingFeatures';

const isIgnored = handleActions<StoreEntries.env.compatibility.isIgnored, Payloads.ignoreCompatiblity>({
  [Event.IGNORE_BROWSER_COMPATIBLITY_REQUESTED]: (_, __) => true,
  [Event.ENFORCE_BROWSER_COMPATIBLITY_REQUESTED]: (_, __) => false,
}, false);


const isBeingChecked = handleActions<StoreEntries.env.compatibility.isBeingChecked, Payloads.isCheckingCompatiblity>({
  [Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED]: (_, __) => true,
  [Event.BROWSER_COMPATIBLITY_CHECK_SUCCEEDED]: (_, __) => false,
  [Event.BROWSER_COMPATIBLITY_CHECK_FAILED]: (_, __) => false,
}, false);

const missingFeatures = handleActions<StoreEntries.env.compatibility.missingFeatures, Payloads.missingFeatureDetected>({
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

export const getMissingFeatures = (state: StoreState) => toArray(state[KEY_MISSING_FEATURES]);

export const isBrowserCompatible = createSelector(
  getMissingFeatures,
  (missing) => missing.length === 0,
)

export default {
  [KEY_IS_IGNORED]: isIgnored,
  [KEY_IS_BEING_CHEKED]: isBeingChecked,
  [KEY_MISSING_FEATURES]: missingFeatures,
};