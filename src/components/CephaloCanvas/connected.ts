import { connect } from 'react-redux';
import CephaloCanvas, { CephaloCanvasProps } from './index';
import { getImageSize, getCanvasSize } from '../../store/reducers/workspace';
import { getScale, getScaleOrigin } from '../../store/reducers/workspace/scale';

interface ConnectedProps {
  className?: string;
} 

const mapStateToProps = (enhancedState: EnhancedState<StoreState>) => {
  const state = enhancedState.present;
  const origin = getScaleOrigin(state);
  const { height: canvasHeight, width: canvasWidth } = getCanvasSize(state);
  const { height: imageHeight, width: imageWidth } = getImageSize(state);
  return {
    canvasHeight, 
    canvasWidth,
    imageWidth,
    imageHeight,
    scale: getScale(state),
    scaleOriginX: origin === null ? '50%' : origin.x,
    scaleOriginY: origin === null ? '50%' : origin.y,
  } as CephaloCanvasProps;
};

const mapDispatchToProps = (dispatch: DispatchFunction) => {
  return {
    dispatch,
  };
};

const connected = connect(
  mapStateToProps, mapDispatchToProps
)(CephaloCanvas) as React.SFCFactory<ConnectedProps>;


export default connected;