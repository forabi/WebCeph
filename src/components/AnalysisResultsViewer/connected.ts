import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import assign from 'lodash/assign';
import AnalysisStepper from './index';
import {
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
    results: getCategorizedAnalysisResults(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onRequestClose: () => dispatch(hideAnalysisResults()),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps
)(AnalysisStepper);


export default connected;
