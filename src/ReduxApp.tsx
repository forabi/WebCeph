import * as React from 'react';
import { Provider, Store } from 'react-redux';
import App from './components/App';
import createConfiguredStore from './store';

declare var window: Window & { __STORE__?: Store<any> };

const store = createConfiguredStore();

if (__DEBUG__) {
  window.__STORE__ = store;
}

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
)