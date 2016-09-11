import * as React from 'react';
import { Provider } from 'react-redux';
import App from './components/App';
import createConfiguredStore from './store';

const store = createConfiguredStore();

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
)