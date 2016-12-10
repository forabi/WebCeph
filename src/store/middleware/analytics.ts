import find from 'lodash/find';
import { Store, Dispatch, Middleware } from 'redux';

const loggable: ActionType[] = [
  'ADD_MANUAL_LANDMARK_REQUESTED',
  'REMOVE_MANUAL_LANDMARK_REQUESTED',
  'TOGGLE_ANALYSIS_RESULTS_REQUESTED',
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
