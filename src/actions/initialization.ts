import { Event } from '../utils/constants';
import { createAction } from 'redux-actions';

export const checkBrowserCompatibility: () => void = createAction(Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED);