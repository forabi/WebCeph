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
  getManualLandmarks,
} from 'store/reducers/workspace/analysis';

import assign from 'lodash/assign';
import curry from 'lodash/curry';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import isEmpty from 'lodash/isEmpty';

type OwnProps = { };

const highlightProps = {
  stroke: 'orange',
  fill: 'orange',
  fillOpacity: 1,
  strokeOpacity: 1,
};

const unhighlightProps = {
  fillOpacity: 0,
  strokeOpacity: 0,
};

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState) => {
    const origin = getScaleOrigin(state);
    const { height: canvasHeight, width: canvasWidth } = getCanvasSize(state);
    const { height: imageHeight, width: imageWidth } = getImageSize(state);
    const highlightedLandmarks = getHighlightedLandmarks(state);
    const isHighlightMode = !isEmpty(highlightedLandmarks);
    const landmarksToDisplay = getLandmarksToDisplay(state);
    const manualLandmarks = getManualLandmarks(state).present;
    const scale = getScale(state);
    const defaultGeoProps = {
      strokeWidth: 2 / scale,
      // filter: 'url(#glow)',
      style: {
        pointerEvents: 'none',
        transitionProperty: 'transform opacity',
        transitionDuration: '0.3s',
      },
    };
    const pointProps = {
      stroke: 'black',
      fill: 'white',
      r: 3 / scale,
      strokeWidth: 1 / scale,
    };
    const vectorProps = {
      stroke: 'black',
      strokeWidth: 1.5 / scale,
    };
    const extendedProps = assign(
      { },
      vectorProps,
      {
        strokeDasharray: '15 10',
        fillOpacity: 0,
        strokeOpacity: 0,
        stroke: 'greenyellow',
      },
    );
    const extendProps = (props: any, symbol: string) => {
      return assign(
        { },
        defaultGeoProps,
        props,
        highlightedLandmarks[symbol] === true ? highlightProps : 
          highlightedLandmarks[symbol] === false ? unhighlightProps : undefined,
      );
    };
    const getPropsForPoint = (symbol: string) => extendProps(pointProps, symbol);
    const getPropsForVector = (symbol: string) => extendProps(vectorProps, symbol);
    const getPropsForAngle = (symbol: string) => {
      let _e_props = extendProps(extendedProps, symbol);
      if (highlightedLandmarks[symbol] === false) {
        _e_props = assign({ }, _e_props, { opacity: 0 });
      }
      return {
        extendedProps: _e_props,
        parallelProps: _e_props,
        segmentProps: extendProps(vectorProps, symbol),
      };
    };
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
      landmarks: sortBy(
        map(
          landmarksToDisplay,
          (value: GeometricalObject, symbol: string) => ({
            symbol,
            label: symbol,
            value,
          }),
        ),
        ({ symbol }) => manualLandmarks[symbol] !== undefined || highlightedLandmarks[symbol] === true,
      ),
      getPropsForPoint,
      getPropsForVector,
      getPropsForAngle,
      isInverted: isImageInverted(state),
      isHighlightMode,
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
