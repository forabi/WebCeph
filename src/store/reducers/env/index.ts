import { createSelector } from 'reselect';

import compatibility, {
  isBrowserCompatible,
  isCompatibilityIgnored,
} from './compat';
import connection from './connection';
import userAgent, { getUserAgent } from './userAgent';

export default {
  ...compatibility,
  ...connection,
  ...userAgent,
};

export const isThisBrowserCompatible = createSelector(
  isBrowserCompatible,
  getUserAgent,
  (isCompatbile, userAgent) => {
    if (userAgent !== null) {
      return isCompatbile(userAgent);
    }
    return null;
  },
);

export const isCompatibilityIgnoredForThisBrowser = createSelector(
  isCompatibilityIgnored,
  getUserAgent,
  (isIgnored, userAgent) => {
    if (userAgent !== null) {
      return isIgnored(userAgent);
    }
    return null;
  },
);

export const isCheckingCompatiblityForThisBrowser = createSelector(
  isCompatibilityIgnored,
  getUserAgent,
  (isChecking, userAgent) => {
    if (userAgent !== null) {
      return isChecking(userAgent);
    }
    return null;
  },
);
