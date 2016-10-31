import * as React from 'react';
import { Provider, Store } from 'react-redux';

import App from './components/App/connected';
import createConfiguredStore from './store';

declare var window: Window & { __STORE__?: Store<any> };

import { hasImage } from 'store/reducers/workspace/image';

const store = createConfiguredStore() as Store<FinalState>;

if (__DEBUG__) {
  window.__STORE__ = store;
}

window.addEventListener('beforeunload', e => {
  if (hasImage((store.getState().present))) {
    const confirmationMessage = (
      'Are you sure you want to close this window?'
    );
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
  return undefined;
});


export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
