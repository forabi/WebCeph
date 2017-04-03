import { createStore, applyMiddleware, combineReducers, compose, Middleware, Reducer } from 'redux';
import reducers from './reducers';
import analyticsMiddleware from './middleware/analytics';
import fetchAnalysisMiddleware from './middleware/fetchAnalysis';
import exportMiddleware from './middleware/export';
import importMiddleware from './middleware/import';
import autoScaleMiddleware from './middleware/autoScale';
import compatibilityMiddleware from './middleware/compatibility';
import fetchLocaleMiddleware from './middleware/fetchLocale';
import {
  saveStateMiddleware,
  loadStateMiddleware,
  clearStateMiddleware,
} from './middleware/persistence';
import workspaceManagerMiddleware from './middleware/workspaceManager';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers<StoreState>(reducers);

const middlewares: Middleware[] = [
  loadStateMiddleware,
  clearStateMiddleware,
  compatibilityMiddleware,
  fetchAnalysisMiddleware,
  fetchLocaleMiddleware,
  workspaceManagerMiddleware,
  importMiddleware,
  exportMiddleware,
  autoScaleMiddleware,
  saveStateMiddleware,
];

if (__DEBUG__) {
  // middlewares.push(analyticsMiddleware);
  const { createLogger } = require('redux-logger');
  middlewares.push(createLogger({
    diff: true,
    duration: true,
    timestamp: true,
  }));
}

const enableLoadingPersistedState = (r: Reducer<StoreState>): Reducer<StoreState> => {
  return (state: StoreState, action: GenericAction) => {
    if (action.type === 'LOAD_PERSISTED_STATE_SUCCEEDED') {
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

const enhancedReducer = enableLoadingPersistedState(reducer);

declare var module: __WebpackModuleApi.Module;

const createConfiguredStore = () => {
  const store = createStore<StoreState>(
    enhancedReducer,
    compose(
      applyMiddleware(...middlewares),
      addDevTools(),
    ),
  );

  if (module.hot) {
    module.hot.accept('./reducers', () => {
      const nextReducer = require('./reducers').default;
      store.replaceReducer(nextReducer);
    });
  }
  return store;
};

export default createConfiguredStore;
