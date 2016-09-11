import * as React from 'react';
import * as ReactDOM from 'react-dom';
import ReduxApp from './ReduxApp';

declare var System: any;

const rootEl = document.getElementById('container');

const render = ReduxApp => ReactDOM.render(<ReduxApp />, rootEl);

render(ReduxApp);

if (module.hot) {
  module.hot.accept('./ReduxApp', () => {
    System.import('./ReduxApp').then(ReduxApp => render(ReduxApp.default));
  });
}
