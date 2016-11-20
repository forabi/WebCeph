import * as React from 'react';
import { Provider, Store } from 'react-redux';

import App from 'components/App/connected';
import createConfiguredStore from 'store';

import { hasUnsavedWork } from 'store/reducers/workspace';

import { connectionStatusChanged } from 'actions/env';

declare var window: Window & { __STORE__?: Store<any> };


const store = createConfiguredStore() as Store<FinalState>;

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

export default () => (
  <Provider store={store}>
    <App userAgent={navigator.userAgent} />
  </Provider>
);
