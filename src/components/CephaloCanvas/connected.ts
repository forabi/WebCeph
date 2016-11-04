import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
  MergeProps,
} from 'react-redux';

import CephaloCanvas from './index';

import {
  ConnectableProps,
  StateProps,
  DispatchProps,
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

type OwnProps = { };

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState) => {
    const origin = getScaleOrigin(state);
    const { height: canvasHeight, width: canvasWidth } = getCanvasSize(state);
    const { height: imageHeight, width: imageWidth } = getImageSize(state);
    return {
      canvasHeight,
      canvasWidth,
      src: getImageData(state) as string,
      imageWidth: imageWidth as number,
      imageHeight: imageHeight as number,
      scale: getScale(state),
      scaleOriginX: origin !== null ? origin.x : null,
      scaleOriginY: origin !== null ? origin.y : null,
      brightness: getImageBrightness(state),
      contrast: getImageContrast(state),
      isFlippedX: isImageFlippedX(state),
      isFlippedY: isImageFlippedY(state),
      landmarks: getAllLandmarks(state),
      isInverted: isImageInverted(state),
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
)(CephaloCanvas);


export default connected;
