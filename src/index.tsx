import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReduxApp, { store } from './ReduxApp';
import { Store } from 'redux';
import { setAppUpdateStatus, setAppInstallStatus } from 'actions/env';
import { isAppInitialized, isAppInstalled } from 'store/reducers/app';

declare var module: __WebpackModuleApi.Module;
declare var window: Window & {
  ResizeObserver?: ResizeObserver;
  __STORE__: Store<StoreState>;
};

if (!__DEBUG__ && location.protocol !== 'https:') {
  // Auto redirect to HTTPS version
  location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}

if (window.ResizeObserver === undefined) {
  window.ResizeObserver = require('resize-observer-polyfill').default;
}

const installOrUpdateApp = () => {
  const state = store.getState();
  const runtime = require('serviceworker-webpack-plugin/lib/runtime');
  runtime.register().then((reg: ServiceWorkerRegistration) => {
    reg.onupdatefound = () => {
      const newWorker = reg.installing;
      const setStatus = isAppInstalled(state) ? setAppUpdateStatus : setAppInstallStatus;
      if (newWorker !== undefined) {
        switch (newWorker.state) {
          case 'installing':
            store.dispatch(
              setStatus({ complete: false }),
            );
            break;
          case 'installed':
            store.dispatch(
              setStatus({ complete: true }),
            );
          default:
            break;
        }
      }
    };
  });
};

if (!__DEBUG__ && 'serviceWorker' in navigator) {
  const unsubscribe = store.subscribe(() => {
    const state = store.getState();
    // Wait for persisted state to load so that we can know whether we are
    // updating the app or installing for the first time.
    if (isAppInitialized(state)) {
      unsubscribe();
      installOrUpdateApp();
    }
  });
}

// import { hasUnsavedWork } from 'store/reducers/workspace';

import { connectionStatusChanged } from 'actions/env';

if (__DEBUG__) {
  window.__STORE__ = store;
}

// window.addEventListener('beforeunload', e => {
//   const state = store.getState();
//   if (hasUnsavedWork(state)) {
//     const confirmationMessage = (
//       'Are you sure you want to close this window?'
//     );
//     e.returnValue = confirmationMessage;
//     return confirmationMessage;
//   }
//   return undefined;
// });

const handleConnectionChange = () => {
  console.info('Connection changed', navigator.onLine);
  store.dispatch(connectionStatusChanged({
    isOffline: !navigator.onLine,
  }));
};

window.addEventListener('online', handleConnectionChange);
window.addEventListener('offline', handleConnectionChange);

const rootEl = document.getElementById('container');

const render = (App: typeof ReduxApp) => ReactDOM.render(
  <App />,
  rootEl,
);

render(ReduxApp);

if (module.hot) {
  module.hot.accept('./ReduxApp', () => {
    const NextApp: typeof ReduxApp = require('./ReduxApp').default;
    render(NextApp);
  });
}
