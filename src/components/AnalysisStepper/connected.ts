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
  AdditionalPropsToMerge,
} from './props';
import {
  getStepState,
  getStepValue,
} from 'store/reducers/workspace/analysis';

import {
  removeManualLandmark,
  highlightStep,
  unhighlightStep,
} from 'actions/workspace';

type OwnProps = { };

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (enhancedState: EnhancedState<StoreState>) => {
  const { present: state } = enhancedState;
  return {
    steps: [],
    getStepState: getStepState(state),
    getStepValue: getStepValue(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onRemoveLandmarkClick: (symbol: string) => dispatch(removeManualLandmark(symbol)),
    onEditLandmarkClick: noop, // @TODO
    onStepMouseEnter: (symbol) => dispatch(highlightStep(symbol)),
    onStepMouseLeave: (symbol) => dispatch(unhighlightStep(symbol)),
  }
);

const mergeProps: MergeProps<StateProps, DispatchProps, OwnProps> = (stateProps, dispatchProps): ConnectableProps => {
  return assign(
    { },
    stateProps,
    dispatchProps,
    { } as AdditionalPropsToMerge,
  );
};

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps
)(AnalysisStepper);


export default connected;
