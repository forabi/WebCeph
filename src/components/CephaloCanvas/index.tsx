import * as React from 'react';

import BrightnessFilter from './filters/Brightness';
import ContrastFilter from './filters/Contrast';
import DropShadow from './filters/DropShadow';
import InvertFilter from './filters/Invert';
import GlowFilter from './filters/Glow';

import * as cx from 'classnames';

import Props from './props';

import GeoViewer from 'components/GeoViewer';

import { mapCursor } from 'utils/constants';

const classes = require('./style.scss');

const getTranslateToCenter = (
  containerWidth: number, containerHeight: number,
  width: number, height: number,
  scale: number
): [number, number] => {
  const translateX = Math.abs(containerWidth - width * scale) / 2;
  const translateY = Math.abs(containerHeight - height * scale) / 2;
  return [translateX, translateY];
};

const noop = () => undefined;

function isMouseEvent<T>(e: any): e is React.MouseEvent<T> {
  return e.touches === undefined;
};

function isTouchEvent<T>(e: any): e is React.TouchEvent<T> {
  return e.touches !== undefined;
};

/**
 * A wrapper around a canvas element.
 * Provides a declarative API for viewing landmarks on a cephalomertic image
 * and performing common edits like brightness and contrast.
 */
export class CephaloCanvas extends React.PureComponent<Props, { }> {
  public refs: {
    canvas: React.ReactInstance,
    image: React.ReactInstance
  };

  render() {
    const {
      className,
      src,
      canvasWidth, canvasHeight,
      imageHeight, imageWidth,
      contrast = 50, brightness = 50,
      getCursorForCanvas = noop,
      getCursorForLandmark,
      getPropsForPoint,
      getPropsForVector,
      getPropsForAngle,
      landmarks,
    } = this.props;
    const minHeight = Math.max(canvasHeight, imageHeight);
    const minWidth = Math.max(canvasWidth, imageWidth);
    return (
      <div style={{ height: minHeight, width: minWidth }}>
        <svg
          ref="canvas"
          className={cx(classes.canvas, className)}
          width={minWidth}
          height={minHeight}
          onWheel={this.handleMouseWheel}
          onContextMenu={this.handleContextMenu}
          onMouseEnter={this.props.onCanvasMouseEnter}
          onMouseLeave={this.props.onCanvasMouseLeave}
          style={{ cursor: mapCursor(getCursorForCanvas()) }}
        >
          <defs>
            <BrightnessFilter id="brightness" value={brightness} />
            <DropShadow id="shadow" />
            <InvertFilter id="invert" />
            <ContrastFilter id="contrast" value={contrast} />
            <GlowFilter id="glow" />
          </defs>
          <g>
            <g filter="url(#shadow)">
              <g filter="url(#brightness)">
                <g>
                  <image
                    ref="image"
                    xlinkHref={src}
                    x={0}
                    y={0}
                    width={imageWidth}
                    height={imageHeight}
                    onMouseDown={this.handleClick}
                    onMouseMove={this.handleCanvasMouseMove}
                    onTouchMove={this.handleCanvasMouseMove}
                    transform={this.getTransformAttribute()}
                    filter={this.getFilterAttribute()}
                  />
                </g>
              </g>
            </g>
            <g transform={this.getTransformAttribute()}>
              <GeoViewer
                top={0}
                left={0}
                width={imageWidth}
                height={imageHeight}
                objects={landmarks}
                getPropsForPoint={getPropsForPoint}
                getPropsForVector={getPropsForVector}
                getPropsForAngle={getPropsForAngle}
              />
            </g>
          </g>
        </svg>
      </div>
    );
  }

  private convertMousePositionRelativeToOriginalImage = (
    e: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>
  ) => {
    const element = e.currentTarget as Element;
    const rect = element.getBoundingClientRect();
    const { imageHeight, imageWidth } = this.props;
    const scaleX = rect.width / imageWidth;
    const scaleY = rect.height / imageHeight;
    const scrollTop = document.documentElement.scrollTop;
    const scrollLeft = document.documentElement.scrollLeft;
    const elementLeft = (rect.left) + scrollLeft;
    const elementTop = (rect.top) + scrollTop;
    const { pageX, pageY } = isMouseEvent(e) ? e : e.touches.item(0);
    let x = (pageX - elementLeft) / scaleX;
    let y = (pageY - elementTop)  / scaleY;
    if (this.props.isFlippedX) {
      x = imageWidth - x;
    }
    if (this.props.isFlippedY) {
      y = imageHeight - y;
    }
    return { x, y };
  }

  private getFilterAttribute = () => {
    let f = '';
    if (this.props.isInverted) {
      f += ' url(#invert)';
    }
    return f;
  }

  private getTransformAttribute = () => {
    const [translateX, translateY] = getTranslateToCenter(
      Math.max(this.props.canvasWidth, this.props.imageWidth),
      Math.max(this.props.canvasHeight, this.props.imageHeight),
      this.props.imageWidth,
      this.props.imageHeight,
      this.props.scale,
    );
    let t = ` translate(${translateX}, ${translateY}) scale(${this.props.scale}, ${this.props.scale})`;
    if (this.props.isFlippedX) {
      t += ` scale(-1, 1) translate(-${this.props.imageWidth}, 0)`;
    }
    if (this.props.isFlippedY) {
      t += ` scale(1, -1) translate(0, -${this.props.imageHeight})`;
    }
    return t;
  };

  private handleMouseWheel = (e: React.WheelEvent<SVGElement>) => {
    if (typeof this.props.onCanvasMouseWheel === 'function') {
      const { x, y } = this.convertMousePositionRelativeToOriginalImage(e);
      this.props.onCanvasMouseWheel(x, y, e.deltaY);
    }
  }

  private handleCanvasMouseMove = (e: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>) => {
    if (typeof this.props.onCanvasMouseMove === 'function') {
      const { x, y } = this.convertMousePositionRelativeToOriginalImage(e);
      this.props.onCanvasMouseMove(x, y);
    }
  }

  private handleClick = (e: React.MouseEvent<SVGElement>) => {
    if (this.props.onCanvasLeftClick !== undefined || this.props.onCanvasRightClick !== undefined) {
      const { x, y } = this.convertMousePositionRelativeToOriginalImage(e);
      const which = e.button;
      if (which === 0 && typeof this.props.onCanvasLeftClick === 'function') {
        this.props.onCanvasLeftClick(x, y);
      } else if (which === 2 && typeof this.props.onCanvasRightClick === 'function') {
        this.props.onCanvasRightClick(x, y);
      }
    }
  };

  private handleContextMenu = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
  };

  private handleLandmarkMouseEnter = (symbol: string) => (_: React.MouseEvent<SVGElement>) => {
    if (typeof this.props.onLandmarkMouseEnter === 'function') {
      this.props.onLandmarkMouseEnter(symbol);
    }
  };

  private handleLandmarkMouseLeave = (symbol: string) => (_: React.MouseEvent<SVGElement>) => {
    if (typeof this.props.onLandmarkMouseLeave === 'function') {
      this.props.onLandmarkMouseLeave(symbol);
    }
  };

  private handleLandmarkClick = (symbol: string) => (e: React.MouseEvent<SVGElement>) => {
    if (typeof this.props.onLandmarkClick === 'function') {
      this.props.onLandmarkClick(symbol, e.nativeEvent as MouseEvent);
    }
  };
}

export default CephaloCanvas;
