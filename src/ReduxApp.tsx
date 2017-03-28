import * as React from 'react';
import { Provider } from 'react-redux';
import { AppContainer } from 'react-hot-loader';

import RootScreen from 'screens/root';
import createConfiguredStore from 'store';

export const store = createConfiguredStore();

export const ReduxApp = () => (
  <Provider store={store}>
    <RootScreen />
  </Provider>
);

export const hotReloadable = () => (
  <AppContainer>
    <ReduxApp />
  </AppContainer>
);

export default hotReloadable;
