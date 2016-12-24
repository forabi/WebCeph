import * as React from 'react';

import BrightnessFilter from './filters/Brightness';
import ContrastFilter from './filters/Contrast';
import DropShadow from './filters/DropShadow';
import InvertFilter from './filters/Invert';
import GlowFilter from './filters/Glow';

import * as cx from 'classnames';

import Props from './props';

import GeoViewer from 'components/GeoViewer';

const classes = require('./style.scss');

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
export class CephaloCanvas extends React.PureComponent<Props, { mouseX: number, mouseY: number }> {
  public refs: {
    canvas: React.ReactInstance;
  };

  state = { mouseX: 0, mouseY: 0 };

  render() {
    const {
      className,
      src,
      canvasSize: { width: canvasWidth, height: canvasHeight },
      imageHeight, imageWidth,
      contrast = 50, brightness = 50,
      scale,
      isHighlightMode,
      getPropsForLandmark,
      landmarks,
    } = this.props;
    const minHeight = Math.max(canvasHeight, imageHeight);
    const minWidth = Math.max(canvasWidth, imageWidth);
    return (
      <div style={{ height: minHeight, width: minWidth }}>
        <svg
          ref={this.setRef}
          className={cx(classes.canvas, className)}
          viewBox={`0 0 ${minWidth} ${minHeight}`}
          onContextMenu={this.handleContextMenu}
          onMouseEnter={this.handleCanvasMouseEnter}
          onMouseLeave={this.handleCanvasMouseLeave}
        >
          <defs>
            <BrightnessFilter id="brightness" value={brightness} />
            <DropShadow id="shadow" />
            <InvertFilter id="invert" />
            <ContrastFilter id="contrast" value={contrast} />
            <GlowFilter id="glow" />
          </defs>
          <g>
            <g filter="">
              <g filter="">
                <image
                  className={classes.image}
                  xlinkHref={src}
                  x={0}
                  y={0}
                  width={imageWidth}
                  height={imageHeight}
                  onWheelCapture={this.handleMouseWheel}
                  onMouseDown={this.handleClick}
                  onMouseMove={this.handleCanvasMouseMove}
                  onTouchMove={this.handleCanvasMouseMove}
                  transform={this.getTransformAttribute()}
                  filter={this.getFilterAttribute()}
                  opacity={isHighlightMode ? 0.5 : 1 }
                />
              </g>
            </g>
            <g transform={this.getTransformAttribute()}>
              <GeoViewer
                top={0}
                left={0}
                width={imageWidth}
                height={imageHeight}
                objects={landmarks}
                getPropsForPoint={getPropsForLandmark}
                getPropsForVector={getPropsForLandmark}
                getPropsForAngle={getPropsForLandmark}
              />
            </g>
          </g>
        </svg>
      </div>
    );
  }

  private setRef = (node: React.ReactInstance) => this.refs.canvas = node;

  private convertMousePositionRelativeToOriginalImage = (
    e: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>,
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
    return { x: Math.round(x), y: Math.round(y) };
  }

  private getFilterAttribute = () => {
    let f = '';
    if (this.props.isInverted) {
      f += ' url(#invert)';
    }
    return f;
  }

  private getTransformAttribute = () => {
    const { scale } = this.props;
    let transform = '';
    const translateX = 0; // (imageWidth * scale) - scaleOriginX;
    const translateY = 0; // (scaleOriginY * scale) - scaleOriginY;
    transform += ` translate(${-1 * translateX}, ${-1 * translateY}) `;
    transform += ` scale(${scale}, ${scale})`;
    if (this.props.isFlippedX) {
      transform += ` scale(-1, 1) translate(-${this.props.imageWidth}, 0)`;
    }
    if (this.props.isFlippedY) {
      transform += ` scale(1, -1) translate(0, -${this.props.imageHeight})`;
    }
    return transform;
  }

  private handleCanvasMouseEnter = (e: React.MouseEvent<SVGElement>) => {
    const { onCanvasMouseEnter } = this.props.activeTool;
    if (typeof onCanvasMouseEnter === 'function') {
      e.preventDefault();
      const { dispatch } = this.props;
      onCanvasMouseEnter(dispatch);
    }
  };

  private handleCanvasMouseLeave = (e: React.MouseEvent<SVGElement>) => {
    const { onCanvasMouseLeave } = this.props.activeTool;
    if (typeof onCanvasMouseLeave === 'function') {
      e.preventDefault();
      const { dispatch } = this.props;
      onCanvasMouseLeave(dispatch);
    }
  };

  private handleMouseWheel = (e: React.WheelEvent<SVGElement>) => {
    const { onCanvasMouseWheel } = this.props.activeTool;
    if (typeof onCanvasMouseWheel === 'function') {
      e.preventDefault();
      const { x, y } = this.convertMousePositionRelativeToOriginalImage(e);
      onCanvasMouseWheel(this.props.dispatch, x, y, e.deltaY);
    }
  }

  private handleCanvasMouseMove = (e: React.MouseEvent<SVGElement> | React.TouchEvent<SVGElement>) => {
    const { onCanvasMouseMove } = this.props.activeTool;
    if (typeof onCanvasMouseMove === 'function') {
      const { x, y } = this.convertMousePositionRelativeToOriginalImage(e);
      const { dispatch } = this.props;
      onCanvasMouseMove(dispatch, x, y);
    }
  }

  private handleClick = (e: React.MouseEvent<SVGElement>) => {
    const { onCanvasLeftClick, onCanvasRightClick } = this.props.activeTool;
    if (onCanvasLeftClick !== undefined || onCanvasRightClick !== undefined) {
      const { x, y } = this.convertMousePositionRelativeToOriginalImage(e);
      const { dispatch } = this.props;
      const which = e.button;
      if (which === 0 && typeof onCanvasLeftClick === 'function') {
        onCanvasLeftClick(dispatch, x, y);
      } else if (which === 2 && typeof onCanvasRightClick === 'function') {
        onCanvasRightClick(dispatch, x, y);
      }
    }
  }

  private handleContextMenu = (e: React.MouseEvent<SVGElement>) => {
    e.preventDefault();
  }

  private handleLandmarkMouseEnter = (symbol: string) => (_: React.MouseEvent<SVGElement>) => {
    const { onLandmarkMouseEnter } = this.props.activeTool;
    if (typeof onLandmarkMouseEnter === 'function') {
      const { dispatch } = this.props;
      onLandmarkMouseEnter(dispatch, symbol);
    }
  }

  private handleLandmarkMouseLeave = (symbol: string) => (_: React.MouseEvent<SVGElement>) => {
    const { onLandmarkMouseLeave } = this.props.activeTool;
    const { dispatch } = this.props;
    if (typeof onLandmarkMouseLeave === 'function') {
      onLandmarkMouseLeave(dispatch, symbol);
    }
  }

  private handleLandmarkClick = (symbol: string) => (e: React.MouseEvent<SVGElement>) => {
    const { onLandmarkClick } = this.props.activeTool;
    const { dispatch } = this.props;
    if (typeof onLandmarkClick === 'function') {
      onLandmarkClick(dispatch, symbol, e.nativeEvent as MouseEvent);
    }
  };
}

export default CephaloCanvas;
