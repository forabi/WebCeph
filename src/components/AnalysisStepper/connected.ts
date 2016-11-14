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
} from 'store/reducers/workspace/tracing';
import {
  getActiveImageParams,
} from 'store/reducers/workspace/image';
import {
  getHighlightedStep,
} from 'store/reducers/workspace/canvas';
import {
  getActiveTreatmentStageId,
} from 'store/reducers/workspace/treatmentStage';

import assign from 'lodash/assign';

import {
  removeManualLandmark,
  highlightStep,
  unhighlightStep,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: FinalState) => {
  const params = getActiveImageParams(state);
  return {
    steps: getActiveAnalysisSteps(state, params),
    getStepState: getStepStateBySymbol(state, params),
    getStepValue: getComputedValueBySymbol(state, params),
    isStepRemovable: isLandmarkRemovable(state, params),
    highlightedStep: getHighlightedStep(state),
    stageId: getActiveTreatmentStageId(state, params),
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
