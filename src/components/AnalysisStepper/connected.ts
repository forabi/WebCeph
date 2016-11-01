import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
} from 'react-redux';
import assign from 'lodash/assign';
import noop from 'lodash/noop';
import AnalysisStepper from './index';
import {
  ConnectableProps,
  StateProps,
  DispatchProps,
  OwnProps,
  AdditionalPropsToMerge,
} from './props';
import {
  getStepStateBySymbol,
  getComputedValueBySymbol,
  getActiveAnalysisSteps,
} from 'store/reducers/workspace/analysis';
import {
  isLandmarkRemovable,
} from 'store/reducers/workspace/analysis/tracing'

import {
  removeManualLandmark,
  highlightStep,
  unhighlightStep,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (enhancedState: EnhancedState<StoreState>) => {
  const { present: state } = enhancedState;
  return {
    steps: getActiveAnalysisSteps(state),
    getStepState: getStepStateBySymbol(state),
    getStepValue: getComputedValueBySymbol(state),
    isStepRemovable: isLandmarkRemovable(state),
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
