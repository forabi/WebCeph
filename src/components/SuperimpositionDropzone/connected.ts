import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import Lens from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getActiveImageQuery,
  getImageData,
  getImageSize,
  isImageFlippedX,
  isImageFlippedY,
} from 'store/reducers/workspace/image';

import {
  getCanvasSize,
  getCanvasPosition,
  getMousePosition,
} from 'store/reducers/workspace/canvas';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState, { margin }: OwnProps) => {
    const query = getActiveImageQuery(state);
    const { top } = getCanvasPosition(state);
    const { width: canvasWidth } = getCanvasSize(state);
    const { x, y } = getMousePosition(state);
    const { width: imageWidth, height: imageHeight } = getImageSize(state, query);
    const width = 200;
    const height = 200;
    return {
      src: getImageData(state),
      x: x !== null ? x :  imageWidth / 2,
      y: y !== null ? y :  imageHeight / 2,
      width, // @TODO: get from state
      height, // @TODO: get from state
      top: top + margin,
      left: canvasWidth - width - margin,
      imageHeight, imageWidth,
      isFlippedX: isImageFlippedX(state, query),
      isFlippedY: isImageFlippedY(state, query),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (_) => (
    {

    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps
)(Lens);


export default connected;
