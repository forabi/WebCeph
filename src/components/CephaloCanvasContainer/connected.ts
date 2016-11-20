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
import { shouldShowLens } from 'store/reducers/workspace/canvas';
import {
  workspaceHasError,
  getWorkspaceErrorMessage,
} from 'store/reducers/workspace';
import {
  canvasResized,
  ignoreWorkspaceError,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state: FinalState) => {
  return {
    hasImage: hasImage(state),
    isLoading: isImageLoading(state),
    shouldShowLens: shouldShowLens(state),
    hasError: workspaceHasError(state),
    errorMessage: getWorkspaceErrorMessage(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onResize: (rect) => dispatch(canvasResized(rect)),
    onRequestDismissError: () => dispatch(ignoreWorkspaceError()),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CephaloDropzone);


export default connected;
