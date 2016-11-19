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
} from './props';

import {
  isAppReady,
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
  appIsReady,
} from 'actions/initialization';

import {
  setAnalysis,
} from 'actions/workspace';

import assign from 'lodash/assign';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState, { userAgent }: OwnProps) => {
    return {
      isSummaryShown: areResultsShown(state) && canShowResults(state),
      shouldShowStepper: hasImage(state) || isImageLoading(state),
      isReady: isAppReady(state),
      shouldCheckCompatibility: (
        isBrowserCompatible(state)(userAgent) ||
        isCheckingCompatiblity(state) ||
        !isCompatibilityIgnored(state)
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
  (stateProps, dispatchProps, ownProps) => {
    const { dispatch } = dispatchProps;
    const { isReady, shouldCheckCompatibility } = stateProps;
    return assign(
      { },
      stateProps,
      dispatchProps,
      ownProps,
      {
        onComponentMount: async () => {
          if (!isReady) {
            await Promise.all([
              dispatch(restorePersistedState()),
            ]);
            dispatch(appIsReady());
          } else if (shouldCheckCompatibility) {
            dispatch(checkBrowserCompatibility());
          }
        },
      }
    );
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps
)(App);


export default connected;
