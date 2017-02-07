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
  isAppInitialized,
} from 'store/reducers/app';

import {
  isCompatibilityIgnored,
  isCheckingCompatiblity,
  isBrowserCompatible,
} from 'store/reducers/env/compat';

import {
  getActiveWorkspaceId,
} from 'store/reducers/workspace/activeId';

import {
  isLastWorkspaceUsed,
  hasMultipleWorkspaces,
} from 'store/reducers/workspace';

import {
  restorePersistedState,
} from 'actions/persistence';

import {
  checkBrowserCompatibility,
} from 'actions/initialization';

import {
  getNegotiatedLocale,
} from 'store/reducers/locale';

import {
  addNewWorkspace,
} from 'actions/workspace';

import uniqueId from 'lodash/uniqueId';

import { connectionStatusChanged } from 'actions/env';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { userAgent }: OwnProps) => {
    return {
      isReady: isAppInitialized(state),
      shouldCheckCompatibility: !(
        isBrowserCompatible(state)(userAgent) ||
        isCompatibilityIgnored(state) ||
        isCheckingCompatiblity(state)
      ),
      activeWorkspaceId: getActiveWorkspaceId(state),
      shouldShowWorkspaceSwitcher: hasMultipleWorkspaces(state) || isLastWorkspaceUsed(state),
      locale: getNegotiatedLocale(state),
      messages: {
        action_load_sample_image: 'حمل صورة للتجربة',
        action_pick_image: 'انقر لاختيار صورة',
        callout_load_sample_image: 'ليس في متناولك صورة الآن؟ جرب صورة من ويكيبيديا!',
        callout_start_tracing: 'لبدء الترسيم، أسقط صورة سيفالومترية أو ضوئية هنا',
      },
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
    const { isReady, shouldCheckCompatibility } = stateProps;
    return {
      ...stateProps,
      ...dispatchProps,
      ...ownProps,
      onComponentMount: () => {
        if (!isReady) {
          dispatch(restorePersistedState(void 0));
        }
        if (shouldCheckCompatibility) {
          dispatch(checkBrowserCompatibility(void 0));
        }
        dispatch(addNewWorkspace({ id: uniqueId('workspace_') }));
        dispatch(connectionStatusChanged({ isOffline: !navigator.onLine }));
      },
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps,
)(App);

export default connected;
