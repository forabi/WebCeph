import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
} from 'react-redux';

import App from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
  ConnectableProps,
} from './props';

import {
  isAppReady,
} from 'store/reducers';

import {
  getUserAgent,
} from 'store/reducers/env/userAgent';

import {
  isThisBrowserCompatible,
  isCompatibilityIgnoredForThisBrowser,
  isCheckingCompatiblityForThisBrowser,
} from 'store/reducers/env';

import {
  getActiveWorkspaceId,
} from 'store/reducers/workspace/activeId';

import {
  isLastWorkspaceUsed,
  hasMultipleWorkspaces,
  getActiveWorkspaceTitle,
} from 'store/reducers/workspace';

import {
  restorePersistedState,
} from 'actions/persistence';

import {
  checkBrowserCompatibility,
} from 'actions/initialization';

import {
  getActiveLocale,
  getActiveLocaleData,
} from 'store/reducers/locale';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState) => {
    return {
      isReady: isAppReady(state),
      shouldCheckCompatibility: !(
        isThisBrowserCompatible(state) ||
        isCompatibilityIgnoredForThisBrowser(state) ||
        isCheckingCompatiblityForThisBrowser(state)
      ),
      activeWorkspaceId: getActiveWorkspaceId(state),
      title: getActiveWorkspaceTitle(state),
      shouldShowWorkspaceSwitcher: hasMultipleWorkspaces(state) || isLastWorkspaceUsed(state),
      locale: getActiveLocale(state),
      messages: getActiveLocaleData(state),
      userAgent: getUserAgent(state),
    };
  };

import { keyMap, createHandlers } from './shortcuts';

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => (
    {
      dispatch,
      handlers: createHandlers(dispatch),
      keyMap,
    }
  );

const mergeProps: MergeProps<StateProps, DispatchProps, OwnProps> =
  (stateProps, dispatchProps, ownProps): ConnectableProps => {
    const { dispatch } = dispatchProps;
    const { isReady, shouldCheckCompatibility, userAgent } = stateProps;
    return {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
      onComponentMount: () => {
        if (!isReady) {
          dispatch(restorePersistedState(void 0));
        }
      },
      onComponentUpdate: () => {
        if (shouldCheckCompatibility) {
          dispatch(checkBrowserCompatibility({ userAgent }));
        }
      },
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps,
)(App);

export default connected;
