import * as React from 'react';
import map from 'lodash/map';
import compact from 'lodash/compact';
import toArray from 'lodash/toArray';
import { findDOMNode } from 'react-dom'; 
import { isGeometricalPoint, isGeometricalLine } from '../../utils/math';

// declare var window: Window & { ResizeObserver: ResizeObserver };

const InvertFilter = ({ id }: { id: string }) => (
  <filter id={id}>
    <feColorMatrix
      in="SourceGraphic" type="matrix"
      values={`
        -1  0  0  0 1
         0 -1  0  0 1
         0  0 -1  0 1
         1  1  1 0  1
      `}
    />
  </filter>
);

const ContrastFilter = ({ id, value = 50 }: { id: string, value: number }) => {
  const c = 0.5 - (value / 100);
  const t = (1 - c) / 2;
  return (
    <filter id={id}>
      <feColorMatrix
        in="SourceGraphic" type="matrix"
        values={`
          1.5 0   0   0 ${c}
          0   1.5 0   0 ${c}
          0   0   1.5 0 ${c}
          0   0   0   1 0
          ${t} ${t} ${t} 0 1
        `}
      />
    </filter>
  );
};

const BrightnessFilter = ({ id, value }: { id: string, value: number }) => (
  <filter id={id}>
    <feComponentTransfer>
      <feFuncR type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncG type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncB type="linear" intercept={(value - 50) / 100} slope="1"/>
    </feComponentTransfer>
  </filter>
);

const DropShadow = ({ id }: { id: string }) => (
  <filter id={id} x="0" y="0" width="200%" height="200%">
    <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
    <feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />
    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
  </filter>
)

const classes = require('./style.scss');

const geometricalObjectToSVG = (value: (GeometricalObject), id: string): (JSX.Element | undefined) => {
  if (isGeometricalPoint(value)) {
    return <circle key={id} r={2} stroke="#fff" strokeWidth={3} cx={value.x} cy={value.y} />
  } else if (isGeometricalLine(value)) {
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
  refs: { canvas: __React.ReactInstance };

  private handleClick = (e: __React.MouseEvent) => {
    if (this.props.onClick) {
      const element = findDOMNode(this.refs.canvas);
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
      <svg
        ref="canvas" 
        onClick={this.handleClick}
        className={this.props.className}
        width={this.props.width} height={this.props.height}
      >
        <defs>
          <BrightnessFilter id="brightness" value={this.props.brightness || 50} />
          <DropShadow id="shadow" />
          <InvertFilter id="invert" />
          <ContrastFilter id="contrast" value={50} />
        </defs>
        <g filter="url(#brightness)">
          <g filter="url(#contrast)">
            <g filter="url(#shadow)">
              <image
                xlinkHref={this.props.src}
                x={this.props.width * 0.05} y={this.props.height * 0.05}
                width={this.props.width * 0.9} height={this.props.height * 0.9}
                filter={this.getFilterAttribute()}
                transform={this.getTransformAttribute()}
              />
            </g>
          </g>
        </g>
        {compact(map(toArray(this.props.landmarks), geometricalObjectToSVG))}
      </svg>
    )
  }
}

export default CephaloCanvas;