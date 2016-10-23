import { connect } from 'react-redux';
import CephaloCanvas from './index';
import {
  ConnectableProps,
  MergeProps,
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
} from '../../store/reducers/workspace/image';
import {
  getCanvasSize,
  getScale,
  getScaleOrigin,
  getAllLandmarks,
  getHighlightedLandmarks,
  getActiveEditorToolCreator,
  getCursorForCanvas,
} from 'store/workspace';
import assign from 'lodash/assign';
import partial from 'lodash/partial';

const mapStateToProps = (enhancedState: EnhancedState<StoreState>) => {
  const state = enhancedState.present;
  const origin = getScaleOrigin(state);
  const { height: canvasHeight, width: canvasWidth } = getCanvasSize(state);
  const { height: imageHeight, width: imageWidth } = getImageSize(state);
  return {
    canvasHeight, 
    canvasWidth,
    src: getImageData(state),
    imageWidth,
    imageHeight,
    scale: getScale(state),
    scaleOriginX: origin === null ? '50%' : origin.x,
    scaleOriginY: origin === null ? '50%' : origin.y,
    brightness: getImageBrightness(state),
    contrast: getImageContrast(state),
    isFlippedX: isImageFlippedX(state),
    isFlippedY: isImageFlippedY(state),
    landmarks: getAllLandmarks(state),
    isInverted: isImageInverted(state),
    isHighlightModeActive: true,
    highlightedLandmarks: getHighlightedLandmarks(state),
    activeTool: partial(getActiveEditorToolCreator, state),
    cursor: getCursorForCanvas(state),
  } as StateProps;
};

const mapDispatchToProps = undefined;

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps): ConnectableProps => {
  return assign(
    { },
    stateProps,
    dispatchProps,
    stateProps.activeTool(dispatchProps.dispatch) as MergeProps,
  );
};

const connected = connect(
  mapStateToProps, mapDispatchToProps, mergeProps
)(CephaloCanvas) as React.SFCFactory<ConnectableProps>;


export default connected;