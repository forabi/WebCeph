import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import CephaloLens from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getImageData,
  getImageSize,
} from 'store/reducers/workspace/image';

import {
  getCanvasSize,
  getCanvasPosition,
  getMousePosition,
} from 'store/reducers/workspace/canvas';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (enhancedState: EnhancedState<StoreState>, { width, margin }: OwnProps) => {
    const { present: state } = enhancedState;
    const { top } = getCanvasPosition(state);
    const { width: canvasWidth } = getCanvasSize(state);
    const { x, y } = getMousePosition(state);
    const { width: imageWidth, height: imageHeight } = getImageSize(state);
    return {
      src: getImageData(state),
      x: x !== null ? x :  imageWidth / 2,
      y: y !== null ? y :  imageHeight / 2,
      top: top + margin,
      left: canvasWidth - width - margin,
      imageHeight, imageWidth,
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (_) => (
    {

    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps
)(CephaloLens);


export default connected;
