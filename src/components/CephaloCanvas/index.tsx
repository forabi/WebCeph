import * as React from 'react';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import { findDOMNode } from 'react-dom'; 
import { isGeometricalPoint, isGeometricalLine } from '../../utils/math';
import { pure } from 'recompose';

// declare var window: Window & { ResizeObserver: ResizeObserver };

const InvertFilter = pure(({ id }: { id: string }) => (
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
));

const ContrastFilter = pure(({ id, value }: { id: string, value: number }) => {
  const c = 1 + (value / 100);
  const t = (1 - c) / 2;
  return (
    <filter id={id}>
      <feColorMatrix
        in="SourceGraphic" type="matrix"
        values={`
          ${c} 0    0    0  ${t}
          0    ${c} 0    0  ${t}
          0    0    ${c} 0  ${t}
          0    0    0    1  1
        `}
      />
    </filter>
  );
});

const BrightnessFilter = pure(({ id, value }: { id: string, value: number }) => (
  <filter id={id}>
    <feComponentTransfer>
      <feFuncR type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncG type="linear" intercept={(value - 50) / 100} slope="1"/>
      <feFuncB type="linear" intercept={(value - 50) / 100} slope="1"/>
    </feComponentTransfer>
  </filter>
));

const DropShadow = pure(({ id }: { id: string }) => (
  <filter id={id} x="0" y="0" width="200%" height="200%">
    <feOffset result="offOut" in="SourceAlpha" dx="0" dy="0" />
    <feGaussianBlur result="blurOut" in="offOut" stdDeviation="3" />
    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
  </filter>
));

interface LandmarkProps {
  value: GeometricalObject;
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
  zIndex: number;
}

const Landmark = ({ value, fill, fillOpacity, stroke, zIndex }: LandmarkProps) => {
  const props = {
    stroke: stroke || '#fff',
    fill: fill || '#55f',
    strokeWidth: 3,
    fillOpacity: fillOpacity || 1,
    strokeOpacity: fillOpacity || 1,
    style: { zIndex },
  };
  if (isGeometricalPoint(value)) {
    return (
      <circle
        r={2} cx={value.x} cy={value.y}
        {...props}
      />
    );
  } else if (isGeometricalLine(value)) {
    return (
      <line
        {...value}
        {...props}
      />
    );
  } else {
    return <span/>;
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
  highlightMode: boolean;
  highlightedLandmarks: { [symbol: string]: boolean };
}

/**
 * A wrapper around a canvas element.
 * Provides a declarative API for viewing landmarks on a cephalomertic image and performing common edits like brightness and contrast.
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
    const {
      highlightMode,
      className,
      src,
      width, height,
      contrast, brightness,
      highlightedLandmarks: highlighted,
    } = this.props;
    return (
      <svg
        ref="canvas" 
        onClick={this.handleClick}
        className={className}
        width={width} height={height}
      >
        <defs>
          <BrightnessFilter id="brightness" value={brightness || 50} />
          <DropShadow id="shadow" />
          <InvertFilter id="invert" />
          <ContrastFilter id="contrast" value={contrast || 50} />
        </defs>
        <g filter="url(#shadow)">
          <g filter="url(#brightness)">
            <g>
              <image
                xlinkHref={src}
                x={width * 0.05} y={height * 0.05}
                width={width * 0.9} height={height * 0.9}
                filter={this.getFilterAttribute()}
                transform={this.getTransformAttribute()}
              />
            </g>
          </g>
        </g>
        {
          sortBy(map(
            this.props.landmarks,
            (landmark, symbol) => {
              let props = {};
              if (highlightMode) {
                if (highlighted[symbol] === true) {
                  props = { stroke: 'blue', fill: 'blue', zIndex: 1 };
                } else {
                  props = { fillOpacity: 0.5, zIndex: 0 };
                }
              }
              return <Landmark {...props} key={symbol} value={landmark} />;
            }
          ), (i: JSX.Element) => i.props.zIndex)
        }
      </svg>
    )
  }
}

export default CephaloCanvas;