import * as React from 'react';
import ReactDOM from 'react-dom';
import assign from 'lodash/assign';
import { connect } from 'react-redux';
import deepDiff, { Diff } from 'deep-diff';

// declare var window: Window & { ResizeObserver: ResizeObserver };

require('fabric');

const classes = require('./style.scss');

const invertFilter = new fabric.Image.filters.Invert();

function isPoint(object: any): object is GeometricalPoint {
  return !!object.x && !!object.y;
}

const geometricalObjectToFabricObject = (value: (GeometricalObject), id: string) => {
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
  landmarks: { [id: string]: GeometricalObject } | { };
  onClick?: (dispatch: Function) => (e: fabric.IEvent) => void;
  onCanvasResized?(e: ResizeObserverEntry): void;
  dispatch: Function;
}

interface CephaloCanvasState {
  image?: fabric.IImage;
  canvas?: fabric.ICanvas;
  landmarksGroup?: fabric.IGroup;
  objectMap: Map<string, fabric.IObject>;
}

const BRIGHTNESS = 0;
const INVERT = 1;

/**
 * A wrapper around a canvas element that provides a declarative API for setting cephalometric radiograph image and provide common edits like brightness and contrast.
 */
export class CephaloCanvas extends React.Component<CephaloCanvasProps, CephaloCanvasState> {
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
    objectMap: new Map<string, fabric.IObject>(),
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
        canvas.on('mouse:up', (e: fabric.IEvent) => {
          if (!this.props.onClick) return;
          this.props.onClick(this.props.dispatch)(e);
        });
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
    const canvas: fabric.ICanvas = this.state.canvas;
    const landmarksGroup: fabric.IGroup = this.state.landmarksGroup;
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

    // @TODO: measure the performance of diffing
    const objectMap = this.state.objectMap;
    if (nextProps.landmarks !== this.props.landmarks) {
      shouldRerender = true;
      const diffs = deepDiff(
        this.props.landmarks,
        nextProps.landmarks
      );
      if (diffs) {
        shouldRerender = true;
        diffs.forEach(diff => {
          if (diff.kind === 'N') {
            const object = geometricalObjectToFabricObject(diff.rhs, diff.path[0]);
            if (object) {
              objectMap.set(diff.path[0], object);
              landmarksGroup.add(object);
            }
          } else if (diff.kind === 'E') {
            objectMap.get(diff.path[0]).set(diff.path[1], diff.rhs);
          } else if (diff.kind === 'D') {
            objectMap.get(diff.path[1]).remove();
            objectMap.delete(diff.path[0]);
          }
        });
      } else {
        console.warn(
          'Previous landmarks are identical to the new ones, ' +
          'even though we had to perform a deep diff. ' + 
          'This is a potentially wasted render cycle.'
        );
      }
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

export default connect()(CephaloCanvas);