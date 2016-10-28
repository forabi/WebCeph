import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
} from 'react-redux';
import assign from 'lodash/assign';
import AnalysisStepper from './index';
import {
  ConnectableProps,
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';
import {
  getCategorizedAnalysisResults,
} from 'store/reducers/workspace/analysis';

import {
  hideAnalysisResults,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (enhancedState: EnhancedState<StoreState>) => {
  const { present: state } = enhancedState;
  return {
    open: false,
    results: getCategorizedAnalysisResults(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onRequestClose: () => dispatch(hideAnalysisResults()),
  }
);

const mergeProps: MergeProps<StateProps, DispatchProps, OwnProps> = (stateProps, dispatchProps): ConnectableProps => {
  return assign(
    { },
    stateProps,
    dispatchProps,
  );
};

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps
)(AnalysisStepper);


export default connected;
