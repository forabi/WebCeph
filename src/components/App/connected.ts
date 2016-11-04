import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import App from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

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

import {
  setAnalysis,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState) => {
    return {
      isSummaryShown: areResultsShown(state) && canShowResults(state),
      shouldShowStepper: hasImage(state) || isImageLoading(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => (
    {
      onComponentMount: () => {
        dispatch(checkBrowserCompatibility());
        dispatch(setAnalysis('common'));
      },
    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(App);


export default connected;
