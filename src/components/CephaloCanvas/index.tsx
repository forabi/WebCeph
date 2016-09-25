import * as React from 'react';
import ReactDOM from 'react-dom';
import assign from 'lodash/assign';
import map from 'lodash/map';
import compact from 'lodash/compact';

// declare var window: Window & { ResizeObserver: ResizeObserver };

require('fabric');

const classes = require('./style.scss');

const invertFilter = new fabric.Image.filters.Invert();

function isPoint(object: any): object is GeometricalPoint {
  return !!object.x && !!object.y;
}

const drawLandmark = (value: (GeometricalLine | GeometricalPoint), id: string) => {
  if (isPoint(value)) {
    return new fabric.Circle({
      left: value.x,
      top: value.y,
      strokeWidth: 3,
      radius: 2,
      fill: '#55f',
      stroke: '#fff',
      hasControls: false,
      hasBorders: false,
      data: { id },
      originX: 'center',
      originY: 'center',
    });
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
  landmarks: { [id: string]: GeometricalLine | GeometricalPoint } | { };
  onClick?(e: fabric.IEvent): void;
  onCanvasResized(e: ResizeObserverEntry): void;
}

interface CephaloCanvasState {
  image?: fabric.IImage;
  canvas?: fabric.ICanvas;
  landmarksGroup?: fabric.IGroup;
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
    canvas: undefined,
    image: undefined,
    landmarksGroup: undefined,
  };

  componentDidMount() {
    const canvas = new fabric.Canvas(
      ReactDOM.findDOMNode(this.refs.canvas) as HTMLCanvasElement,
      {
        height: this.props.height,
        width: this.props.width,
      }
    );
    const landmarksGroup = new fabric.Group();
    canvas.add(landmarksGroup);
    fabric.Image.fromURL(
      this.props.src,
      image => {
        canvas.add(image);
        image.sendToBack().center();
        image.setCoords();
        canvas.on('mouse:up', this.props.onClick);
        this.setState(
          {
            canvas,
            image,
            landmarksGroup,
          },
          () => {
            this.handlePropChanges(this.props);
          },
        );
      },
      assign(
        (this.props.height < this.props.width ?
          { height: this.props.height } :
          { width: this.props.width }
        ),
        {
          scaleX: 0.9,
          scaleY: 0.9,
          selectable: false,
          hasControls: false,
        }
      ),
    );
  }

  componentWillUnmount() {
    if (this.state.canvas) {
      this.state.canvas.removeListeners();
    }
  }

  shouldComponentUpdate(__: CephaloCanvasProps) {
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
    const img: fabric.IImage = this.state.image;
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

    // @TODO: invistigate the possibilty and efficency of diffing
    if (nextProps.landmarks !== this.props.landmarks) {
      shouldRerender = true;
      const objectsToDraw = compact(map(nextProps.landmarks, drawLandmark));
      this.state.landmarksGroup.add(...objectsToDraw);
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