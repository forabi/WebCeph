import * as React from 'react';
import ReactDOM from 'react-dom';

require('fabric');

const classes = require('./style.scss');

const invertFilter = new fabric.Image.filters.Invert();

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
  landmarks?: (GeometricalLine | GeometricalPoint)[];
  onClick?(e: MouseEvent): void;
}

interface CephaloCanvasState {
  image?: fabric.IImage;
  canvas?: fabric.ICanvas;
}

const BRIGHTNESS = 0;
const INVERT = 1;

/**
 * A wrapper around a canvas element that provides a declarative API for setting cephalometric radiograph image and provide common edits like brightness and contrast.
 */
export default class CephaloCanvas extends React.Component<CephaloCanvasProps, CephaloCanvasState> {
  defaultProps = {
   brightness: 0,
   contrast: 0,
   inverted: false,
   flipX: false,
   flipY: false,
   landmarks: [],
  }

  state = {
    image: undefined,
    canvas: undefined,
  }

  componentDidMount() {
    const canvas = new fabric.Canvas(
      ReactDOM.findDOMNode(this.refs.canvas) as HTMLCanvasElement,
      {
        height: this.props.height,
        width: this.props.width,
      }
    );
    fabric.Image.fromURL(this.props.src, image => {
      canvas.add(image);
      image.center();
      this.setState(
        {
          canvas,
          image,
        },
        () => {
          this.handlePropChanges(this.props);
        },
      );
    }, {
      scaleX: 0.8,
      scaleY: 0.8,
    });
  }

  shouldComponentUpdate(nextProps: CephaloCanvasProps) {
    return false;
  }

  componentWillReceiveProps(nextProps: CephaloCanvasProps) {
    this.handlePropChanges(nextProps);
  }

  handlePropChanges(nextProps: CephaloCanvasProps) {
    if (
      typeof this.state.canvas === 'undefined' || 
      typeof this.state.image === 'undefined'
    ) return;
    const img = this.state.image;
    const canvas = this.state.canvas;
    let shouldRerender = false;
    if (nextProps.flipX !== this.props.flipX) {
      img.setFlipX(nextProps.flipX || this.defaultProps.flipX);
      shouldRerender = true;
    }

    if (nextProps.flipY !== this.props.flipY) {
      img.setFlipY(nextProps.flipY|| this.defaultProps.flipY);
      shouldRerender = true;
    }

    if (nextProps.brightness !== this.props.brightness) {
      const filter = new fabric.Image.filters.Brightness({
        brightness: nextProps.brightness || this.defaultProps.brightness
      });
      img.filters[BRIGHTNESS] = filter;
      shouldRerender = true;
    }

    if (nextProps.inverted !== this.props.inverted) {
      if (nextProps.inverted || this.defaultProps.inverted) {
        img.filters[INVERT] = invertFilter;
      } else {
        delete img.filters[INVERT];
      }
      shouldRerender = true;
    }

    if (nextProps.contrast !== this.props.contrast) {
      // @TODO: set contrast
      shouldRerender = true;
    }

    img.applyFilters(() => {
      if (shouldRerender) {
        canvas.renderAll();
      }
    });
  }

  render() {
    this.handlePropChanges(this.props);
    return (
      <div className={this.props.className}>
        <canvas key={0} ref="canvas" />
      </div>
    )
  }
}