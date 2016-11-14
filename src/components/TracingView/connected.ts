import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
} from 'react-redux';

import TracingView from './index';

import {
  ConnectableProps,
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getImageSize,
  getImageData,
  getImageBrightness,
  getImageContrast,
  isImageFlippedX,
  isImageFlippedY,
  isImageInverted,
} from 'store/reducers/workspace/image';

import {
  getCanvasSize,
  getScale,
  getScaleOrigin,
  getActiveToolCreator,
} from 'store/reducers/workspace/canvas';

import {
  getHighlightedLandmarks,
} from 'store/reducers/workspace';
import {
  getAllLandmarks,
} from 'store/reducers/workspace/analysis';

import assign from 'lodash/assign';
import curry from 'lodash/curry';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState, { imageId }: OwnProps) => {
    const origin = getScaleOrigin(state);
    const params = { imageId };
    const { height: canvasHeight, width: canvasWidth } = getCanvasSize(state, params);
    const { height: imageHeight, width: imageWidth } = getImageSize(state, params);
    return {
      canvasHeight,
      canvasWidth,
      src: getImageData(state, params) as string,
      imageWidth: imageWidth as number,
      imageHeight: imageHeight as number,
      scale: getScale(state),
      scaleOriginX: origin !== null ? origin.x : null,
      scaleOriginY: origin !== null ? origin.y : null,
      brightness: getImageBrightness(state, params),
      contrast: getImageContrast(state, params),
      isFlippedX: isImageFlippedX(state, params),
      isFlippedY: isImageFlippedY(state, params),
      landmarks: getAllLandmarks(state, params),
      isInverted: isImageInverted(state, params),
      highlightedLandmarks: getHighlightedLandmarks(state),
      activeTool: curry(getActiveToolCreator(state))(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => ({ dispatch });

const mergeProps: MergeProps<StateProps, DispatchProps, OwnProps> =
  (stateProps, dispatchProps, ownProps): ConnectableProps => {
    return assign(
      { },
      ownProps,
      stateProps,
      dispatchProps,
      stateProps.activeTool(dispatchProps.dispatch),
    );
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps, mergeProps,
)(TracingView);


export default connected;
