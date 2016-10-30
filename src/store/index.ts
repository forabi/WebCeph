import { createStore, applyMiddleware, combineReducers, compose, Middleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import reducers from './reducers';
import { Event } from '../utils/constants';
import undoable, { includeAction } from 'redux-undo';
import analyticsMiddleware from './middleware/analytics';
import fetchAnalysis from './middleware/fetchAnalysis';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = undoable(
  combineReducers(reducers),
  {
    undoType: Event.UNDO_REQUESTED,
    redoType: Event.REDO_REQUESTED,
    limit: 100,
    filter: includeAction([
      Event.ADD_MANUAL_LANDMARK_REQUESTED,
      Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
    ]),
  },
);

const sagaMiddleware = createSagaMiddleware();

const middlewares: Middleware[] = [
  sagaMiddleware,
  fetchAnalysis,
];

if (__DEBUG__) {
  middlewares.push(analyticsMiddleware);
}

function addDevTools() {
  if (process.env.NODE_ENV !== 'production' && !!window.devToolsExtension) {
    return window.devToolsExtension();
  }
  return (f: any) => f;
}

const createConfiguredStore = () => {
  const store = createStore(
    reducer,
    compose(
      applyMiddleware(...middlewares),
      addDevTools(),
    ),
  );
  sagaMiddleware.run(rootSaga);
  return store;
};

export default createConfiguredStore;