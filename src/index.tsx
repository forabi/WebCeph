import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import ReduxApp from './ReduxApp';
const rootEl = document.getElementById('container');

const render = Component => ReactDOM.render(<AppContainer><Component/></AppContainer>, rootEl);

render(ReduxApp);

if (module.hot) {
  module.hot.accept('./ReduxApp', () => {
    render(require('./ReduxApp').default);
  });
}
