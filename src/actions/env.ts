import { createActionCreator } from 'utils/store';

export const connectionStatusChanged = createActionCreator('CONNECTION_STATUS_CHANGED');

export const setAppUpdateStatus = createActionCreator('APP_UPDATE_STATUS_CHANGED');
export const setAppInstallStatus = createActionCreator('APP_INSTALL_STATUS_CHANGED');

export const envLocalesChanged = createActionCreator('ENV_LOCALES_CHANGED');

export const fetchLocaleStarted = createActionCreator('FETCH_LOCALE_STARTED');
export const fetchLocaleSucceeded = createActionCreator('FETCH_LOCALE_SUCCEEDED');
export const fetchLocaleFailed = createActionCreator('FETCH_LOCALE_FAILED');
