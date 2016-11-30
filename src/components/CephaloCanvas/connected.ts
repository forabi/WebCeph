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
  getLandmarksToDisplay,
} from 'store/reducers/workspace/analysis';

import assign from 'lodash/assign';
import curry from 'lodash/curry';
import map from 'lodash/map';
import isEmpty from 'lodash/isEmpty';

import {
  isGeometricalPoint,
  isGeometricalVector,
  isGeometricalAngle,
} from 'utils/math';

type OwnProps = { };

const highlightProps = {
  stroke: 'orange',
  fill: 'orange',
  opacity: 1,
};

const unhighlightProps = {
  opacity: 0.5,
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState) => {
    const origin = getScaleOrigin(state);
    const { height: canvasHeight, width: canvasWidth } = getCanvasSize(state);
    const { height: imageHeight, width: imageWidth } = getImageSize(state);
    const landmarksToDisplay = getLandmarksToDisplay(state);
    const highlightedLandmarks = getHighlightedLandmarks(state);
    const isHighlightMode = !isEmpty(highlightedLandmarks);
    const scale = getScale(state);
    const defaultGeoProps = {
      strokeWidth: 2 / scale,
      pointerEvents: 'none',
      transitionProperty: 'transform opacity',
      transitionDuration: '0.3s',
    };
    const pointProps = {
      stroke: 'darkviolet',
      fill: 'white',
      r: 2 / scale,
      strokeWidth: 1 / scale,
    };
    const vectorProps = {
      stroke: 'cornflowerblue',
      strokeWidth: 2 / scale,
    };
    const extendedProps = assign(
      { },
      vectorProps,
      {
        strokeDasharray: '15 10',
        opacity: 0,
        stroke: 'greenyellow',
      },
    );
    const angleProps = {
      segmentProps: vectorProps,
      extendedProps,
      parallelProps: extendedProps,
    };
    const extendProps = (props: any, symbol: string) => {
      return assign(
        { },
        defaultGeoProps,
        props,
        isHighlightMode ? (
          highlightedLandmarks[symbol] !== undefined ? (
            highlightProps
          ) : unhighlightProps
        ) : undefined,
      );
    };
    const getPropsForPoint = (symbol: string) => extendProps(pointProps, symbol);
    const getPropsForVector = (symbol: string) => extendProps(vectorProps, symbol);
    const getPropsForAngle = (symbol: string) => extendProps(angleProps, symbol);
    return {
      canvasHeight,
      canvasWidth,
      src: getImageData(state) as string,
      imageWidth: imageWidth as number,
      imageHeight: imageHeight as number,
      scale,
      scaleOriginX: origin !== null ? origin.x : null,
      scaleOriginY: origin !== null ? origin.y : null,
      brightness: getImageBrightness(state),
      contrast: getImageContrast(state),
      isFlippedX: isImageFlippedX(state),
      isFlippedY: isImageFlippedY(state),
      landmarks: map(
        landmarksToDisplay,
        (value: GeometricalObject, symbol: string) => ({
          symbol,
          label: symbol,
          value,
        }),
      ),
      getPropsForPoint,
      getPropsForVector,
      getPropsForAngle,
      isInverted: isImageInverted(state),
      highlightedLandmarks,
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
