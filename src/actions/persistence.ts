import { createActionCreator } from 'utils/store';

export const restorePersistedState = createActionCreator('LOAD_PERSISTED_STATE_REQUESTED');

export const restorePersistedStateSucceeded = createActionCreator('LOAD_PERSISTED_STATE_SUCCEEDED');

export const restorePersistedStateFailed = createActionCreator('LOAD_PERSISTED_STATE_FAILED');

export const persistStateUpgradeStarted = createActionCreator('PERSIST_STATE_UPGRADE_STARTED');

export const persistStateStarted = createActionCreator('PERSIST_STATE_STARTED');

export const persistStateSucceeded = createActionCreator('PERSIST_STATE_SUCCEEDED');

export const persistStateFailed = createActionCreator('PERSIST_STATE_FAILED');

export const clearPersistedStateRequested = createActionCreator('CLEAR_PRESISTED_STATE_SUCCEEDED');

export const clearPersistedStateSucceeded = createActionCreator('CLEAR_PRESISTED_STATE_SUCCEEDED');

export const clearPersistedStateFailed = createActionCreator('CLEAR_PERSISTED_STATE_FAILED');
