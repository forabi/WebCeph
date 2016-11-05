import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import CephaloDropzone from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';
import { hasImage, isImageLoading } from 'store/reducers/workspace/image';
import {
  getTreatmentStagesIdsInOrder,
  getActiveTreatmentStageId,
} from 'store/reducers/workspace/analysis/tracing/manualLandmarks';
import { getWorkspaceMode } from 'store/reducers/workspace';
import { shouldShowLens } from 'store/reducers/workspace/canvas';
import { canvasResized } from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: FinalState) => {
  const mode = getWorkspaceMode(state);
  let stageIds: string[];
  if (mode === 'superimposition') {
    stageIds = getTreatmentStagesIdsInOrder(state);
  } else {
    stageIds = [getActiveTreatmentStageId(state)];
  }
  return {
    hasImage: hasImage(state),
    isLoading: isImageLoading(state),
    shouldShowLens: shouldShowLens(state),
    stageIds,
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onResize: (rect) => dispatch(canvasResized(rect)),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CephaloDropzone);


export default connected;
