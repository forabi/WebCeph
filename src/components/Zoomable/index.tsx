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

class Zoomable extends React.PureComponent<Props, any> {
  ref: HTMLDivElement;
  private matrix = new Matrix();

  setRef = (ref: HTMLDivElement) => this.ref = ref;

  applyZoom(f: number, { x: mouseX, y: mouseY }: Coords) {
    const act = new Matrix();
    act.translate(mouseX, mouseY);
    act.scaleU(f);
    act.translate(-mouseX, -mouseY);
    const m = this.matrix.multiply(act);
    const decomposed = m.decompose();
    const scale = decomposed.scale.x;
    const x = decomposed.translate.x;
    const y = decomposed.translate.y;
    this.props.onZoom(scale, x, y);
  }

  getMouseCoords(e: React.MouseEvent<HTMLDivElement>) {
    const { top, left } = this.ref.getBoundingClientRect();
    const x = e.clientX - Math.round(left);
    const y = e.clientY - Math.round(top);
    return { x, y };
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
    const { scale, originX, originY } = newProps;
    this.matrix.reset();
    this.matrix.translate(originX, originY);
    this.matrix.scaleU(scale);
    this.matrix.translate(-originX, -originY);
  }

  render() {
    const { style, children, ...rest } = this.props;
    return (
      <div
        {...rest}
        ref={this.setRef}
        style={{ ...style, transform: this.matrix.toCSS3D() }}
        onContextMenu={this.handleContextMenu}
        onMouseDown={this.handleMouseDown}
        onWheel={this.handleMouseWheel}
      >
        {children}
      </div>
    );
  }
};

export default Zoomable;
