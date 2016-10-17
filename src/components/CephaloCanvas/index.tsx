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
  zIndex?: number;
  onClick: React.EventHandler<React.MouseEvent>;
  onMouseEnter: React.EventHandler<React.MouseEvent>;
  onMouseLeave: React.EventHandler<React.MouseEvent>;
}

const Landmark = (_props: LandmarkProps) => {
  const { value, fill, fillOpacity, zIndex, stroke, onClick, onMouseEnter, onMouseLeave } = _props;
  const props = {
    onClick, onMouseEnter, onMouseLeave,
    stroke: stroke || '#fff',
    fill: fill || '#55f',
    strokeWidth: 3,
    fillOpacity: fillOpacity || 1,
    strokeOpacity: fillOpacity || 1,
    style: { zIndex: zIndex },
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
  height: number;
  width: number;
  zoom: number;
  zoomX: number;
  zoomY: number;
  landmarks: { [id: string]: GeometricalObject } | { };
  onLeftClick?(x: number, y: number): void;
  onResized?(e: ResizeObserverEntry): void;
  onMouseWheel?(x: number, y: number, delta: number): void;
  onRightClick?(x: number, y: number): void;
  onMouseEnter?(): void;
  onMouseLeave?(): void;
  onLandmarkMouseEnter(symbol: string): void;
  onLandmarkMouseLeave(symbol: string): void;
  onLandmarkClick(symbol: string, e: React.MouseEvent): void;
  highlightMode: boolean;
  highlightedLandmarks: { [symbol: string]: boolean };
}

function translate(x, y, scale, zoomX, zoomY, width, height) {
  const originX = 0; //x - x/scale;
  const originY = 0; //y - y/scale;
  return {
    x: (x / scale) - originX,
    y: (y / scale) - originY,
  };
}

/**
 * A wrapper around a canvas element.
 * Provides a declarative API for viewing landmarks on a cephalomertic image and performing common edits like brightness and contrast.
 */
export class CephaloCanvas extends React.PureComponent<CephaloCanvasProps, { }> {
  refs: { canvas: React.ReactInstance };

  private getRelativeMousePosition = (e: { pageX: number, pageY: number }) => {
    const element = findDOMNode(this.refs.canvas);
    const rect = element.getBoundingClientRect();
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;
    const elementLeft = rect.left + scrollLeft * this.props.zoom;  
    const elementTop = rect.top + scrollTop * this.props.zoom;
    return {
      x: e.pageX - elementLeft,
      y: e.pageY - elementTop
    };
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
    const zoomX = this.props.zoomX;
    const zoomY = this.props.zoomY;
    console.log(zoomX, zoomY);
    // const zoomTranslateX = originX - (zoomX / zoom - zoomX);
    // const zoomTranslateY = originY - (zoomY / zoom - zoomY);
    const originX = 0;
    const originY = 0;
    const zoom = this.props.zoom / 100;
    const scale = (zoom >= 0 ? zoom : 1 / Math.abs(zoom));
    const { height, width } = this.props;
    // console.log({
    //   scale, zoom, zoomX, zoomY, originX, originY,
    //   zoomTranslateX, zoomTranslateY,
    // });
    t = `scale(${scale}, ${scale}) `;
    t += `translate(${originX/scale - originX}, ${originY/scale - originY}) `;
    t += `translate(${(width/scale - width) / 2}, ${(height/scale - height) / 2}) `;
    t += `translate(${(zoomX/scale - zoomX)}, ${(zoomY/scale - zoomY)}) `;
    if (this.props.flipX) {
      t += ` scale(-1, 1) translate(-${this.props.width}, 0)`;
    }
    if (this.props.flipY) {
      t += ` scale(1, -1) translate(0, -${this.props.height})`;
    }
    return t;
  }

  private handleMouseWheel = (e: React.WheelEvent) => {
    // __DEBUG__ && console.log('Mouse wheel');
    if (typeof this.props.onMouseWheel === 'function') {
      const { x, y } = this.getRelativeMousePosition(e);
      this.props.onMouseWheel(x, y, e.nativeEvent.wheelDelta);
    }
  }

  private handleClick = (e: React.MouseEvent) => {
    // __DEBUG__ && console.log('Mouse down', e.button);
    if (this.props.onLeftClick !== undefined || this.props.onRightClick !== undefined) {
      const { x, y } = this.translateCoordinates(this.getRelativeMousePosition(e));
      const which = e.button;
      if (which === 0 && typeof this.props.onLeftClick === 'function') {
        // Left mouse click
        this.props.onLeftClick(x, y);
      } else if (which === 2 && typeof this.props.onRightClick === 'function') {
        // Right mouse click
        this.props.onRightClick(x, y);
      }
    }
  };

  private handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  private handleLandmarkMouseEnter = (symbol: string) => (e: React.MouseEvent) => {
    // __DEBUG__ && console.log('Landmark mouse enter', e);
    if (typeof this.props.onLandmarkMouseEnter === 'function') {
      this.props.onLandmarkMouseEnter(symbol);
    }
  };

  private handleLandmarkMouseLeave = (symbol: string) => (e: React.MouseEvent) => {
    // __DEBUG__ && console.log('Landmark mouse leave', e);
    if (typeof this.props.onLandmarkMouseLeave === 'function') {
      this.props.onLandmarkMouseLeave(symbol);
    }
  };

  private handleLandmarkClick = (symbol: string) => (e: React.MouseEvent) => {
    // __DEBUG__ && console.log('Landmark mouse click', e);
    if (typeof this.props.onLandmarkClick === 'function') {
      this.props.onLandmarkClick(symbol, e);
    }
  };

  private translateCoordinates = ({ x, y }: { x: number, y: number }) => {
    return translate(
      x, y,
      this.props.zoom / 100,
      this.props.zoomX, this.props.zoomY,
      this.props.width, this.props.height
    );
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
        className={className}
        width={width} height={height}
        onMouseDown={this.handleClick}
        onWheel={this.handleMouseWheel}
        onContextMenu={this.handleContextMenu}
        onMouseEnter={this.props.onMouseEnter}
        onMouseLeave={this.props.onMouseLeave}
      >
        <defs>
          <BrightnessFilter id="brightness" value={brightness || 50} />
          <DropShadow id="shadow" />
          <InvertFilter id="invert" />
          <ContrastFilter id="contrast" value={contrast || 50} />
        </defs>
        <g transform={this.getTransformAttribute()}>
          <g filter="url(#shadow)">
            <g filter="url(#brightness)">
              <g>
                <image
                  xlinkHref={src}
                  x={width * 0.05} y={height * 0.05}
                  width={width * 0.9} height={height * 0.9}
                  filter={this.getFilterAttribute()}
                />
              </g>
            </g>
          </g>
          {
            sortBy(map(
              this.props.landmarks,
              (landmark: GeometricalObject, symbol: string) => {
                let props = {};
                if (highlightMode) {
                  if (highlighted[symbol] === true) {
                    props = { stroke: 'blue', fill: 'blue', zIndex: 1 };
                  } else {
                    props = { fillOpacity: 0.5, zIndex: 0 };
                  }
                }
                // const scale = this.props.zoom / 100;
                // const translateX = scale / 100; 
                // const transform = `scale(${scale}) translate(${translateX}, ${translateY})`; 
                return <Landmark
                  key={symbol}
                  onMouseEnter={this.handleLandmarkMouseEnter(symbol)}
                  onMouseLeave={this.handleLandmarkMouseLeave(symbol)}
                  onClick={this.handleLandmarkClick(symbol)}
                  value={landmark}
                  {...props}
                />;
              }
            ), (i: JSX.Element) => i.props.zIndex)
          }
        </g>
      </svg>
    )
  }
}

export default CephaloCanvas;