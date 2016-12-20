import { createStore, applyMiddleware, combineReducers, compose, Middleware, Reducer } from 'redux';
import reducers from './reducers';
import analyticsMiddleware from './middleware/analytics';
import fetchAnalysis from './middleware/fetchanalyses';
import exportMiddleware from './middleware/export';
import importMiddleware from './middleware/import';
import autoScaleMiddleware from './middleware/autoScale';
import compatibilityMiddleware from './middleware/compatibility';
import {
  saveStateMiddleware,
  loadStateMiddleware,
  clearStateMiddleware,
} from './middleware/persistence';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers(reducers);

const middlewares: Middleware[] = [
  compatibilityMiddleware,
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

const enableLoadingPersistedState = (r: Reducer<StoreState>): Reducer<StoreState> => {
  return (state: StoreState, action: GenericAction) => {
    if (action.type == 'LOAD_PERSISTED_STATE_SUCCEEDED') {
      return {
        ...r(state, action),
        ...action.payload,
      };
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
  const store = createStore<StoreState>(
    enableLoadingPersistedState(reducer),
    compose(
      applyMiddleware(...middlewares),
      addDevTools(),
    ),
  );
  return store;
};

export default createConfiguredStore;
