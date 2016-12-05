import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import CephaloCanvas from './index';

import {
  StateProps,
  DispatchProps,
} from './props';

import {
  getImageHeight,
  getImageWidth,
  getImageData,
  getImageBrightness,
  getImageContrast,
  isImageFlippedX,
  isImageFlippedY,
  isImageInverted,
} from 'store/reducers/workspace/image';

import {
  getCanvasHeight,
  getCanvasWidth,
} from 'store/reducers/workspace/canvas/canvasSize';

import {
  getScale,
  getActiveTool,
} from 'store/reducers/workspace/canvas';

import {
  getHighlightedLandmarks,
  getSortedLandmarksToDisplay,
  getLandmarksToDisplay,
  isHighlightMode,
} from 'store/reducers/workspace';

import * as cx from 'classnames';

type OwnProps = { };

const classes = require('./style.scss');
import { createSelector } from 'reselect';

import {
  isGeometricalAngle,
  isGeometricalPoint,
  isGeometricalVector,
} from 'utils/math';

const getPropsForLandmark = createSelector(
  isHighlightMode,
  getHighlightedLandmarks,
  getLandmarksToDisplay,
  (isHighlightMode, highlighted, toDisplay) => (symbol: string) => {
    type Props = {
      className: string | undefined;
      segmentProps?: any;
      parallelProps?: any;
      extendedProps?: any;
      rest?: any;
      r?: string | number;
      [prop: string]: any;
    };

    const props: Props = {
      className: undefined,
    };

    const classNames: string[] = [];

    const l = toDisplay[symbol];
    if (isGeometricalPoint(l)) {
      classNames.push(classes.point);
      props.r = '0.5rem';
    } else if (isGeometricalVector(l)) {
      classNames.push(classes.vector);
    } else if (isGeometricalAngle(l)) {
      classNames.push(classes.angle);
      props.segmentProps = {
        className: classes.vector,
      };
      props.parallelProps = {
        className: classes.vector_parallel,
      };
      props.extendedProps = {
        className: classes.vector_extended,
      };
    }

    if (isHighlightMode) {
      if (highlighted[symbol]) {
        classNames.push(classes.landmark_highlighted);
      } else {
        classNames.push(classes.landmark_unhighlighted);
      }
    }
    props.className = cx(...classNames);

    return props;
  },
);

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState) => {
    return {
      canvasHeight: getCanvasHeight(state) as number,
      canvasWidth: getCanvasWidth(state) as number,
      src: getImageData(state) as string,
      imageWidth: getImageWidth(state) as number,
      imageHeight: getImageHeight(state) as number,
      scale: getScale(state),
      brightness: getImageBrightness(state),
      contrast: getImageContrast(state),
      isFlippedX: isImageFlippedX(state),
      isFlippedY: isImageFlippedY(state),
      landmarks: getSortedLandmarksToDisplay(state),
      isInverted: isImageInverted(state),
      isHighlightMode: isHighlightMode(state),
      highlightedLandmarks: getHighlightedLandmarks(state),
      activeTool: getActiveTool(state),
      getPropsForLandmark: getPropsForLandmark(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => ({ dispatch });

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CephaloCanvas);


export default connected;
