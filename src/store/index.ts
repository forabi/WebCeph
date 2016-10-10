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
  if (module.hot) {
    console.log('HOT!!');
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      console.log('HEY!');
      const nextRootReducer = require('./reducers/index').default;
      console.log('hey!', nextRootReducer);
      store.replaceReducer(nextRootReducer);
    });
  } else {
    console.log('NOT HOT');
  }
  return store;
};

export default createConfiguredStore;