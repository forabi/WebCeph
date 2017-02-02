import * as React from 'react';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';

import App from 'components/App/connected';
import createConfiguredStore from 'store';

export const store = createConfiguredStore();

export const ReduxApp = () => (
  <Provider store={store}>
    <App userAgent={navigator.userAgent} />
  </Provider>
);

export const hotReloadable = () => (
  <AppContainer>
    <ReduxApp />
  </AppContainer>
);

export default hotReloadable;
