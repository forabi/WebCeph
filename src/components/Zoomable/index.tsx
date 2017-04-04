import * as React from 'react';

import { Matrix } from 'transformation-matrix-js';

import mapValues from 'lodash/mapValues';

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

  getMouseCoords(ev: React.MouseEvent<HTMLDivElement>) {
    const { top, left } = this.eventTarget.getBoundingClientRect();
    const { e: translateX, f: translateY } = this.matrix;
    const x = ev.clientX - Math.round(left) + translateX;
    const y = ev.clientY - Math.round(top) + translateY;
    return mapValues(this.matrix.inverse().applyToPoint(x, y), Math.round);
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
    const { style, children, ...rest } = this.props;
    return (
      <div ref={this.setScrollable} className={classes.root}>
        <div
          {...rest}
          ref={this.setEventTarget}
          className={classes.zoomable}
          style={{
            ...style,
            transform: this.matrix.toCSS3D(),
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
