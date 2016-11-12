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
import { hasAnyImage, isAnyImageLoading, getActiveImageId } from 'store/reducers/workspace/image';
import {
  getSuperimposedImageIdsInOrder,
} from 'store/reducers/workspace/superimposition';
import { getWorkspaceMode } from 'store/reducers/workspace';
import { shouldShowLens } from 'store/reducers/workspace/canvas';
import { canvasResized } from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: FinalState) => {
  const mode = getWorkspaceMode(state);
  let imageIds: string[];
  if (mode === 'superimposition') {
    imageIds = getSuperimposedImageIdsInOrder(state);
  } else {
    imageIds = [getActiveImageId(state)];
  }
  return {
    mode,
    hasImage: hasAnyImage(state),
    isLoading: isAnyImageLoading(state),
    shouldShowLens: shouldShowLens(state),
    imageIds,
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
