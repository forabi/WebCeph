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
  getActiveImageId,
  getImageProps,
} from 'store/reducers/workspace/image';

import {
  getMousePosition,
  getCanvasDimensions,
} from 'store/reducers/workspace/canvas';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { margin }: OwnProps) => {
    const { top, width: canvasWidth } = getCanvasDimensions(state);
    const { x, y } = getMousePosition(state)!;
    const props = getImageProps(state)(getActiveImageId(state)!);
    const { width: imageWidth, height: imageHeight } = props;
    const width = 200;
    const height = 200;
    return {
      src: props.data,
      x: x !== null ? x :  imageWidth / 2,
      y: y !== null ? y :  imageHeight / 2,
      width, // @TODO: get from state
      height, // @TODO: get from state
      top: top + margin,
      left: canvasWidth - width - margin,
      imageHeight, imageWidth,
      isFlippedX: props.flipX,
      isFlippedY: props.flipY,
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
