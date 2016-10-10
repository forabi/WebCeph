import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './sagas';
import reducers from './reducers';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers(reducers);

const sagaMiddleware = createSagaMiddleware();

const middlewares = [
  sagaMiddleware,
];

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