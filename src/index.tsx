import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReduxApp from './ReduxApp';

declare var System: any;
declare var module: __WebpackModuleApi.Module;
declare var window: Window & { ResizeObserver?: ResizeObserver };

if (window.ResizeObserver === undefined) {
  window.ResizeObserver = require('resize-observer-polyfill').default;
}

const rootEl = document.getElementById('container');

const render = (App: typeof ReduxApp) => ReactDOM.render(<App />, rootEl);

render(ReduxApp);

if (module.hot) {
  module.hot.accept('./ReduxApp', () => {
    System.import('./ReduxApp').then((App: { default: typeof ReduxApp }) => render(App.default));
  });
}
