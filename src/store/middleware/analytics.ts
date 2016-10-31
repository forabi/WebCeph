import { Event } from 'utils/constants';
import find from 'lodash/find';
import { Store, Dispatch, Middleware } from 'redux';

const loggable = [
  Event.ADD_MANUAL_LANDMARK_REQUESTED,
  Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
  Event.SHOW_ANALYSIS_RESULTS_REQUESTED,
];

const isLoggable = (type: string) => {
  return Boolean(find(
    loggable,
    type
  ));
};

const middleware: Middleware = (store: Store<any>) => (next: Dispatch<any>) => (action: Action<any>) => {
  const { type, payload } = action;
  if (isLoggable(type)) {
    console.log('It works!', type, payload, store.getState());
    // @TODO: fetch();
  }
  return next(action);
};

export default middleware;
