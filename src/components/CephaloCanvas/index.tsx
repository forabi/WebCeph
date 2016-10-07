import * as React from 'react';
import map from 'lodash/map';
import compact from 'lodash/compact';
import toArray from 'lodash/toArray';
import { findDOMNode } from 'react-dom'; 
import { isGeometricalPoint, isGeometricalLine } from '../../utils/math';

// declare var window: Window & { ResizeObserver: ResizeObserver };

const INVERT_FILTER = (
  <filter id="invert">
    <feColorMatrix
      in="SourceGraphic"
      type="matrix"
      values="-1 0 0 0 1 0 -1 0 0 1 0 0 -1 0 1 0 0 0 1 0"
    />
  </filter>
);

const getBrightnessFilter = (value: number) => (
  <filter id="brightness">
    <feComponentTransfer>
      <feFuncR type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncG type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncB type="linear" intercept={(value - 50) / 100} slope="1"/>
    </feComponentTransfer>
  </filter>
)

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
    return <line key={id} {...value} stroke="#fff" strokeWidth={3} fill="#55f" />;
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
  onClick?: (e: { X: number, Y: number }) => void;
  onCanvasResized?(e: ResizeObserverEntry): void;
}

/**
 * A wrapper around a canvas element.
 * Provides a declarative API for viewing landmarks on a cephalomertic image and performing common edits like brightness and contrast.
 * This component uses a React-like diffing mechanism to avoid expensive redraws of landmarks that have not changed
 */
export class CephaloCanvas extends React.PureComponent<CephaloCanvasProps, { }> {
  refs: { image: __React.ReactInstance };

  private handleClick = (e: __React.MouseEvent) => {
    if (this.props.onClick) {
      const element = findDOMNode(this.refs.image);
      const rect = element.getBoundingClientRect();
      const scrollTop = document.documentElement.scrollTop;
      const scrollLeft = document.documentElement.scrollLeft;
      const elementLeft = rect.left + scrollLeft;  
      const elementTop = rect.top + scrollTop;
      this.props.onClick({
        X: e.pageX - elementLeft,
        Y: e.pageY - elementTop,
      });
    }
  }

  private getFilterAttribute = () => {
    let f = '';
    if (this.props.inverted) {
      f += " url(#invert)";
    }
    return f;
  }

  private getTransformAttribute = () => {
    let t = '';
    if (this.props.flipX) {
      t += ` scale(-1, 1) translate(-${this.props.width}, 0)`;
    }
    if (this.props.flipY) {
      t += ` scale(1, -1) translate(0, -${this.props.height})`;
    }
    return t;
  }

  render() {
    return (
      <svg className={this.props.className} height={this.props.height} width={this.props.width}>
        {getBrightnessFilter(this.props.brightness || 50)}
        <g filter="url(#brightness)">
          {INVERT_FILTER}
          <image
            xlinkHref={this.props.src}
            ref="image" onClick={this.handleClick}
            width={this.props.width} height={this.props.height}
            filter={this.getFilterAttribute()}
            transform={this.getTransformAttribute()}
          />
        </g>
        {compact(map(toArray(this.props.landmarks), geometricalObjectToSVG))}
      </svg>
    )
  }
}

export default CephaloCanvas;