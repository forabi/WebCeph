import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import noop from 'lodash/noop';
import AnalysisStepper from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';
import {
  getStepStateBySymbol,
  getComputedValueBySymbol,
  getActiveAnalysisSteps,
} from 'store/reducers/workspace/analysis';
import {
  isLandmarkRemovable,
} from 'store/reducers/workspace/tracing';
import {
  getHighlightedStep,
} from 'store/reducers/workspace/canvas';

import {
  removeManualLandmark,
  highlightStep,
  unhighlightStep,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: FinalState) => {
  return {
    steps: getActiveAnalysisSteps(state),
    getStepState: getStepStateBySymbol(state),
    getStepValue: getComputedValueBySymbol(state),
    isStepRemovable: isLandmarkRemovable(state),
    highlightedStep: getHighlightedStep(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onRemoveLandmarkClick: (symbol: string) => dispatch(removeManualLandmark(symbol)),
    onEditLandmarkClick: noop, // @TODO
    onStepMouseEnter: (symbol) => dispatch(highlightStep(symbol)),
    onStepMouseLeave: (_) => dispatch(unhighlightStep()),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(AnalysisStepper);


export default connected;
