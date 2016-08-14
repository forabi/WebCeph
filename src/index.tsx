import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './components/App';

declare var System: any;

const rootEl = document.getElementById('container');

const render = App => ReactDOM.render(<App />, rootEl);

render(App);

if (module.hot) {
  module.hot.accept('./components/App', () => {
    System.import('./components/App').then(App => render(App.default));
  });
}
