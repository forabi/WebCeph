import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
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
} from 'store/reducers/workspace/analysis/tracing';
import {
  getHighlightedStep,
} from 'store/reducers/workspace/canvas';
import {
  getActiveImageId,
} from 'store/reducers/workspace/treatmentStage';

import assign from 'lodash/assign';

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
    stageId: getActiveImageId(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onEditLandmarkClick: noop, // @TODO
    onStepMouseEnter: (symbol) => dispatch(highlightStep(symbol)),
    onStepMouseLeave: (_) => dispatch(unhighlightStep()),
    dispatch,
  }
);

const mergeProps: MergeProps<StateProps, DispatchProps, OwnProps> =
  (stateProps, dispatchProps, ownProps) => {
    const { stageId } = stateProps;
    const { dispatch } = dispatchProps;
    return assign(
      { },
      stateProps,
      dispatchProps,
      ownProps,
      {
        onRemoveLandmarkClick: (symbol: string) => {
          if (stageId !== null) {
            dispatch(removeManualLandmark(symbol, stageId));
          }
        },
      }
    );
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps,
)(AnalysisStepper);


export default connected;
