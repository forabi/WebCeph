import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
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
  toggleAnalysisResults,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: StoreState) => {
  return {
    results: getCategorizedAnalysisResults(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onRequestClose: () => dispatch(toggleAnalysisResults(void 0)),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps
)(AnalysisStepper);


export default connected;
