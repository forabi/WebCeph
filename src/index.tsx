import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReduxApp, { store } from './ReduxApp';
import { Store } from 'redux';
import { setAppUpdateStatus } from 'actions/env';

declare var System: any;
declare var module: __WebpackModuleApi.Module;
declare var window: Window & {
  ResizeObserver?: ResizeObserver;
  __STORE__: Store<StoreState>;
};

if (!__DEBUG__ && location.protocol !== 'https:') {
 location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

if (window.ResizeObserver === undefined) {
  window.ResizeObserver = require('resize-observer-polyfill').default;
}

if (!__DEBUG__ && 'serviceWorker' in navigator) {
  const runtime = require('serviceworker-webpack-plugin/lib/runtime');
  runtime.register().then((reg: ServiceWorkerRegistration) => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      if (newWorker !== undefined) {
        switch (newWorker.state) {
          case 'installing':
            store.dispatch(
              setAppUpdateStatus({ complete: false }),
            );
            break;
          case 'installed':
            store.dispatch(
              setAppUpdateStatus({ complete: true }),
            );
          default:
            break;
        }
      }
    };
  });
}

import { hasUnsavedWork } from 'store/reducers/workspace';

import { connectionStatusChanged } from 'actions/env';

if (__DEBUG__) {
  window.__STORE__ = store;
}

window.addEventListener('beforeunload', e => {
  const state = store.getState();
  if (hasUnsavedWork(state)) {
    const confirmationMessage = (
      'Are you sure you want to close this window?'
    );
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
  return undefined;
});

const handleConnectionChange = () => {
  console.log('Connection changed', navigator.onLine);
  store.dispatch(connectionStatusChanged({
    isOffline: !navigator.onLine,
  }));
};

window.addEventListener('online', handleConnectionChange);
window.addEventListener('offline', handleConnectionChange);

const rootEl = document.getElementById('container');

const render = (App: typeof ReduxApp) => ReactDOM.render(<App />, rootEl);

render(ReduxApp);

if (module.hot) {
  module.hot.accept('./ReduxApp', () => {
    System.import('./ReduxApp').then((App: { default: typeof ReduxApp }) => render(App.default));
  });
}
