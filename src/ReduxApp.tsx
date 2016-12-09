import * as React from 'react';
import { Provider, Store } from 'react-redux';

import App from 'components/App/connected';
import createConfiguredStore from 'store';

export const store = createConfiguredStore() as Store<StoreState>;

export default () => (
  <Provider store={store}>
    <App userAgent={navigator.userAgent} />
  </Provider>
);
