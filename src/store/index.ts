import { createStore, applyMiddleware, combineReducers, compose, Middleware, Reducer } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import reducers from './reducers';
import analyticsMiddleware from './middleware/analytics';
import fetchAnalysis from './middleware/fetchAnalysis';
import exportMiddleware from './middleware/export';
import importMiddleware from './middleware/import';
import autoScaleMiddleware from './middleware/autoScale';
import {
  saveStateMiddleware,
  loadStateMiddleware,
  clearStateMiddleware,
} from './middleware/persistence';

import { Event } from 'utils/constants';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers(reducers);

const sagaMiddleware = createSagaMiddleware();

const middlewares: Middleware[] = [
  sagaMiddleware,
  fetchAnalysis,
  importMiddleware,
  exportMiddleware,
  autoScaleMiddleware,
  saveStateMiddleware,
  loadStateMiddleware,
  clearStateMiddleware,
];

if (__DEBUG__) {
  middlewares.push(analyticsMiddleware);
}

import assign from 'lodash/assign';

const enableLoadingPersistedState = (r: Reducer<any>): Reducer<any> => {
  return (state: FinalState, action: Action<any>) => {
    if (action.type === Event.LOAD_PERSISTED_STATE_SUCCEEDED) {
      return assign(
        { },
        r(state, action),
        action.payload,
      );
    }
    return r(state, action);
  };
};

function addDevTools() {
  if (process.env.NODE_ENV !== 'production' && !!window.devToolsExtension) {
    return window.devToolsExtension();
  }
  return (f: any) => f;
}

const createConfiguredStore = () => {
  const store = createStore(
    enableLoadingPersistedState(reducer),
    compose(
      applyMiddleware(...middlewares),
      addDevTools(),
    ),
  );
  sagaMiddleware.run(rootSaga);
  return store;
};

export default createConfiguredStore;
