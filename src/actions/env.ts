import { createActionCreator } from 'utils/store';

export const connectionStatusChanged = createActionCreator('CONNECTION_STATUS_CHANGED');

export const setAppUpdateStatus = createActionCreator('APP_CACHING_STATUS_CHANGED');
