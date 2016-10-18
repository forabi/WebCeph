import { Event } from '../utils/constants';
import { createAction } from 'redux-actions';

export const checkBrowserCompatibility = createAction<void>(Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED);

export const loadPersistedState = createAction<void>(Event.LOAD_PERSISTED_STATE_REQUESTED);
export const saveState: (key: string, value: { [id: string]: any } | Array<any>) => void = createAction(Event.PERSIST_STATE_REQUESTED, (key, value) => { key, value });