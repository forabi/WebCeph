import { Event } from '../utils/constants';
import { createAction } from 'redux-actions';

export const connectionStatusChanged: (
  payload: Payloads.connectionStatusChanged
) => Action<Payloads.connectionStatusChanged> = createAction<Payloads.connectionStatusChanged>(
  Event.CONNECTION_STATUS_CHANGED,
);
