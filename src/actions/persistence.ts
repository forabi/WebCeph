import { Event } from '../utils/constants';
import { createAction } from 'redux-actions';

export const restorePersistedState = createAction<Payloads.loadPersistedState>(
  Event.LOAD_PERSISTED_STATE_REQUESTED,
);

export const restorePersistedStateSucceeded = createAction<Payloads.loadPersistedStateSucceeded>(
  Event.LOAD_PERSISTED_STATE_SUCCEEDED,
);

export const restorePersistedStateFailed = createAction<Payloads.loadPersistedStateFailed>(
  Event.LOAD_PERSISTED_STATE_FAILED,
);

export const persistStateStarted = createAction<Payloads.persistStateRequested>(
  Event.PERSIST_STATE_STARTED,
);

export const persistStateSucceeded = createAction<Payloads.persistStateSucceeded>(
  Event.PERSIST_STATE_SUCCEEDED,
);

export const persistStateFailed = createAction<Payloads.persistStateFailed>(
  Event.PERSIST_STATE_FAILED,
);

export const clearPersistedStateRequested = createAction<Payloads.clearPersistedStateRequested>(
  Event.CLEAR_PRESISTED_STATE_SUCCEEDED,
);

export const clearPersistedStateSucceeded = createAction<Payloads.clearPersistedStateSucceeded>(
  Event.CLEAR_PRESISTED_STATE_SUCCEEDED,
);

export const clearPersistedStateFailed = createAction<Payloads.clearPersistedStateFailed>(
  Event.CLEAR_PERSISTED_STATE_FAILED,
);
