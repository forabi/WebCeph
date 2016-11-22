import * as React from 'react';
import * as ReactDOM from 'react-dom';

import ReduxApp, { store } from './ReduxApp';
import { setAppUpdateStatus } from 'actions/env';

declare var System: any;
declare var module: __WebpackModuleApi.Module;
declare var window: Window & { ResizeObserver?: ResizeObserver };

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
              setAppUpdateStatus({ complete: false })
            );
            break;
          case 'installed':
            store.dispatch(
              setAppUpdateStatus({ complete: true })
            );
          default:
            break;
        }
      }
    };
  });
}

const rootEl = document.getElementById('container');

const render = (App: typeof ReduxApp) => ReactDOM.render(<App />, rootEl);

render(ReduxApp);

if (module.hot) {
  module.hot.accept('./ReduxApp', () => {
    System.import('./ReduxApp').then((App: { default: typeof ReduxApp }) => render(App.default));
  });
}
