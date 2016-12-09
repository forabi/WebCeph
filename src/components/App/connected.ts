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
} from 'store/reducers/env/init';

import {
  isCompatibilityIgnored,
  isCheckingCompatiblity,
  isBrowserCompatible,
} from 'store/reducers/env/compatibility';

import {
  restorePersistedState,
} from 'actions/persistence';

import {
  areResultsShown,
  canShowResults,
} from 'store/reducers/workspace/analysis';

import {
  hasImage,
  isImageLoading,
} from 'store/reducers/workspace/image';

import {
  checkBrowserCompatibility,
} from 'actions/initialization';

import { connectionStatusChanged } from 'actions/env';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { userAgent }: OwnProps) => {
    return {
      isSummaryShown: areResultsShown(state) && canShowResults(state),
      shouldShowStepper: hasImage(state) || isImageLoading(state),
      isReady: isAppInitialized(state),
      shouldCheckCompatibility: !(
        isBrowserCompatible(state)(userAgent) ||
        isCompatibilityIgnored(state) ||
        isCheckingCompatiblity(state)
      ),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => (
    {
      dispatch,
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
      onComponentMount: async () => {
        if (!isReady) {
          dispatch(restorePersistedState(void 0));
        }
        if (shouldCheckCompatibility) {
          dispatch(checkBrowserCompatibility(void 0));
        }
        dispatch(connectionStatusChanged({ isOffline: !navigator.onLine }));
      },
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps,
)(App);

export default connected;
