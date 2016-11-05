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
  getImageDataByStageId,
  getActiveImageSize,
  isActiveImageFlippedX,
  isActiveImageFlippedY,
} from 'store/reducers/workspace/image';

import {
  getCanvasSize,
  getCanvasPosition,
  getMousePosition,
} from 'store/reducers/workspace/canvas';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState, { margin }: OwnProps) => {
    const { top } = getCanvasPosition(state);
    const { width: canvasWidth } = getCanvasSize(state);
    const { x, y } = getMousePosition(state);
    const { width: imageWidth, height: imageHeight } = getActiveImageSize(state);
    const width = 200;
    const height = 200;
    return {
      src: getImageDataByStageId(state),
      x: x !== null ? x :  imageWidth / 2,
      y: y !== null ? y :  imageHeight / 2,
      width, // @TODO: get from state
      height, // @TODO: get from state
      top: top + margin,
      left: canvasWidth - width - margin,
      imageHeight, imageWidth,
      isFlippedX: isActiveImageFlippedX(state),
      isFlippedY: isActiveImageFlippedY(state),
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
