import * as React from 'react';

import { Matrix } from 'transformation-matrix-js';

import round from 'lodash/round';

import mapValues from 'lodash/mapValues';

import * as cx from 'classnames';

const roundCoordinate = (n: number) => round(n, 3);

type Coords = { x: number, y: number };

type Props = React.HTMLAttributes<HTMLDivElement> & {
  originX: number;
  originY: number;
  scale: number;
  onZoom(scale: number, translateX: number, translateY: number): any;
};

const classes = require('./style.scss');

class Zoomable extends React.PureComponent<Props, any> {
  eventTarget: HTMLDivElement;
  scrollable: HTMLDivElement;
  private matrix = new Matrix();

  setEventTarget = (node: HTMLDivElement) => this.eventTarget = node;
  setScrollable = (node: HTMLDivElement) => this.scrollable = node;

  applyZoom(f: number, { x: mouseX, y: mouseY }: Coords) {
    console.log({ mouseX, mouseY });
    this.props.onZoom(
      this.props.scale * f,
      mouseX, mouseY,
    );
  }

  applyPan() {
    
  }

  /**
   * Gets the original mouse position relative to the element
   * as if the coordinates were on the element without the transformations
   * applied to it.
   */
  getMouseCoords(ev: React.MouseEvent<HTMLDivElement>) {
    const { top, left } = this.eventTarget.getBoundingClientRect();
    // The mouse coordinates do not include the translation of the element,
    // so we reapply the translation manually.
    const { e: translateX, f: translateY } = this.matrix;
    const x = ev.clientX - Math.round(left) + translateX;
    const y = ev.clientY - Math.round(top) + translateY;
    // Now we have the mouse position applied correctly to the transormation
    // matrix, we inverse the matrix to get the original point on the element
    // with no transformations applied.
    const originalPoint = this.matrix.inverse().applyToPoint(x, y);
    return mapValues(originalPoint, roundCoordinate) as typeof originalPoint;
  }

  handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    this.applyZoom(e.button === 2 ? 0.9 :  1.1, this.getMouseCoords(e));
  }

  handleMouseWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const delta = e.deltaY;
    this.applyZoom(delta > 0 ? 0.9 : 1.1, this.getMouseCoords(e));
  }

  handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  componentWillReceiveProps(newProps: Props) {
    this.matrix.reset();
    const { scale, originX, originY } = newProps;
    const act = new Matrix();
    act.translate(originX, originY);
    act.scaleU(scale);
    act.translate(-originX, -originY);
    this.matrix.multiply(act);
  }

  render() {
    const { style, className, children, ...rest } = this.props;
    return (
      <div ref={this.setScrollable} className={cx(classes.root, className)}>
        <div
          {...rest}
          ref={this.setEventTarget}
          className={classes.zoomable}
          style={{
            ...style,
            transform: this.matrix.toCSS3D(),
            // This is required as CSS defaults to center
            transformOrigin: '0 0',
          }}
          onContextMenu={this.handleContextMenu}
          onMouseDown={this.handleMouseDown}
          onWheel={this.handleMouseWheel}
        >
          {children}
        </div>
      </div>
    );
  }
};

export default Zoomable;
