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
  getStepState,
  getCalculatedValue,
  getActiveAnalysisSteps,
  isStepSkippable,
  isStepRemovable,
} from 'store/reducers/workspace/analyses';
import {
  getHighlightedStep,
} from 'store/reducers/workspace/canvas';

import {
  removeManualLandmark,
  highlightStep,
  unhighlightStep,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: StoreState) => {
  return {
    steps: getActiveAnalysisSteps(state),
    getStepState: getStepState(state),
    getStepValue: getCalculatedValue(state),
    highlightedStep: getHighlightedStep(state),
    isStepRemovable,
    isStepSkippable,
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onRemoveLandmarkClick: ({ symbol }) => dispatch(removeManualLandmark({ symbol })),
    onEditLandmarkClick: noop, // @TODO
    onStepMouseEnter: ({ symbol }) => dispatch(highlightStep({ symbol })),
    onStepMouseLeave: (_) => dispatch(unhighlightStep(void 0)),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(AnalysisStepper);


export default connected;
