import * as React from 'react';
import mapValues from 'lodash/mapValues';
import { connect } from 'react-redux';
import { isGeometricalPoint, isGeometricalLine } from '../../utils/math';

// declare var window: Window & { ResizeObserver: ResizeObserver };

const classes = require('./style.scss');


const geometricalObjectToSVG = (value: (GeometricalObject), id: string): (JSX.Element | undefined) => {
  if (isGeometricalPoint(value)) {
    // return new fabric.Circle({
    //   left: value.x,
    //   top: value.y,
    //   strokeWidth: 3,
    //   radius: 2,
    //   fill: '#55f',
    //   stroke: '#fff',
    //   hasControls: false,
    //   hasBorders: false,
    //   data: { id },
    //   originX: 'center',
    //   originY: 'center',
    // });
    return <circle key={id} r={2} stroke="#fff" strokeWidth={3} cx={value.x} cy={value.y} />
  } else if (isGeometricalLine(value)) {
    // return new fabric.Line([value.x1, value.y1, value.x2, value.y2], {
    //   fill: '#55f',
    //   stroke: '#fff',
    //   strokeWidth: 3,
    //   selectable: false,
    //   originX: 'center',
    //   originY: 'center',
    // });
    return <line key={id} {...value} strokeWidth={3} fill="#55f" />;
  } else {
    return undefined;
  }
};

interface CephaloCanvasProps {
  className?: string;
  src: string;
  brightness?: number;
  contrast?: number;
  inverted?: boolean;
  flipX?: boolean;
  flipY?: boolean;
  height: number,
  width: number,
  landmarks: { [id: string]: GeometricalObject } | { };
  onClick?: (dispatch: Function) => (e: fabric.IEvent) => void;
  onCanvasResized?(e: ResizeObserverEntry): void;
  dispatch: Function;
}

/**
 * A wrapper around a canvas element.
 * Provides a declarative API for viewing landmarks on a cephalomertic image and performing common edits like brightness and contrast.
 * This component uses a React-like diffing mechanism to avoid expensive redraws of landmarks that have not changed
 */
export class CephaloCanvas extends React.PureComponent<CephaloCanvasProps, { }> {
  defaultProps = {
   brightness: 0,
   contrast: 0,
   inverted: false,
   flipX: false,
   flipY: false,
   landmarks: [],
  }

  render() {
    return (
      <div className={this.props.className}>
        <image xlinkHref={this.props.src}width={this.props.width} height={this.props.height} />
        {mapValues(this.props.landmarks, geometricalObjectToSVG)}
      </div>
    )
  }
}

export default connect()(CephaloCanvas);