import { createActionCreator } from 'utils/store';

export const checkBrowserCompatibility = createActionCreator('BROWSER_COMPATIBLITY_CHECK_REQUESTED');

export const compatiblityCheckSucceeded = createActionCreator('BROWSER_COMPATIBLITY_CHECK_SUCCEEDED');
export const compatiblityCheckFailed = createActionCreator('BROWSER_COMPATIBLITY_CHECK_FAILED');

export const foundMissingFeature = createActionCreator('MISSING_BROWSER_FEATURE_DETECTED');

export const appIsReady = createActionCreator('APP_IS_READY');
