import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import CephaloCanvas from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getImageProps
} from 'store/reducers/workspace/image';

import {
  getCanvasDimensions
} from 'store/reducers/workspace/canvas';

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

const classes = require('./style.scss');
import { createSelector } from 'reselect';

import {
  isGeoAngle,
  isGeoPoint,
  isGeoVector,
} from 'utils/math';

import { PointProps, AngleProps, VectorProps } from 'components/GeoViewer';

const EMPTY_ARRAY = [];

const getHighlightClassNames = createSelector(
  isHighlightMode,
  getHighlightedLandmarks,
  (isHighlight, highlighted) => memoize((symbol: string): string[] => {
    if (isHighlight) {
      if (highlighted[symbol]) {
        return [classes.highlighted];
      } else {
        return [classes.landmark_unhighlighted];
      }
    }
    return EMPTY_ARRAY;
  }),
);

import memoize from 'lodash/memoize';

const getPropsForLandmark = createSelector(
  getHighlightClassNames,
  getLandmarksToDisplay,
  (getHighlightClassNames, toDisplay) => memoize((symbol: string) => {
    type Props = AngleProps | VectorProps | PointProps;

    const props: Props = {
      className: undefined,
    };

    const classNames: string[] = [];

    const l = toDisplay[symbol];
    if (isGeoPoint(l)) {
      classNames.push(classes.point);
      props.r = '0.5rem';
    } else if (isGeoVector(l)) {
      classNames.push(classes.vector);
    } else if (isGeoAngle(l)) {
      classNames.push(classes.angle);
      props.segmentProps = {
        className: cx(classes.vector, ...getHighlightClassNames(symbol)),
      };
      props.parallelProps = {
        className: cx(classes.vector_parallel, ...getHighlightClassNames(symbol)),
      };
      props.extendedProps = {
        className: cx(classes.vector_extended, ...getHighlightClassNames(symbol)),
      };
      props.angleIndicatorProps = {
        className: cx(classes.angle_indicator, ...getHighlightClassNames(symbol)),
        r: '2.5cm',
      }
    }
    
    props.className = cx(...classNames, ...getHighlightClassNames(symbol));

    return props;
  }),
);

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { imageId }: OwnProps) => {
    return {
      canvasSize: getCanvasDimensions(state),
      src: getImageProps(state)(imageId).data,
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
