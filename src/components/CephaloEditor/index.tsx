import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Dropzone from 'react-dropzone';
import { assign } from 'lodash';
import FlatButton from 'material-ui/FlatButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconBrightness from 'material-ui/svg-icons/image/brightness-5';
import IconControlPoint from 'material-ui/svg-icons/image/control-point';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import ImageWorker = require('worker!./worker');
import { ImageWorkerData } from './worker';
import * as cx from 'classnames';
import { fabric } from 'fabric';
import { mapValues, pick } from 'lodash';

require('jimp/browser/lib/jimp.js');

import classes = require('./styles.css');
import DropzonePlaceholder from './assets/placeholder.svg';

interface ImagePickerProps {
  className: string,
}

interface ImagePickerState {
  image?: Object,
  canvas?: Object,
  hasImage: boolean,
  open: boolean,
  anchorEl: Object,
  isEditing: boolean,
  brightness: number,
  sharpen: boolean,
}

interface ImagePickerRefs {
  canvas: any,
  canvasContainer: any,
}

export interface Edit {
  method: string,
  args: Array<any>,
  isDestructive?: boolean,
}

const invertFilter = new fabric.Image.filters.Invert();

export default class CephaloEditor extends React.Component<ImagePickerProps, ImagePickerState> {
  private listener: EventListener;
  private worker: ImageWorker;
  private edits: Array<Edit> = [];
  refs: ImagePickerRefs = { canvas: null, canvasContainer: null };
  state = {
    open: false, anchorEl: null,
    canvas: null, image: null, hasImage: false,
    isEditing: false,
    brightness: 0, invert: false,
  };

  handleDrop = (files) => {
    const file: File = files[0];
    
    this.setState(assign({ }, this.state, { hasImage: true }) as ImagePickerState, () => {
      const canvasEl = ReactDOM.findDOMNode(this.refs.canvas);
      const canvasContainerEl = ReactDOM.findDOMNode(this.refs.canvasContainer);
      const { height, width }: any = 
        mapValues(
          pick(window.getComputedStyle(canvasContainerEl), 'height', 'width'),
          dim => Number(dim.replace('px', ''))
        );
      
      const reader = new FileReader();
      reader.onload =  e => {
        Jimp.read(e.target.result).then(img => {
          img.scaleToFit(height * 0.5, width * 0.5).getBase64(Jimp.MIME_BMP, (err, data) => {
            const canvas = new fabric.Canvas(canvasEl, { height, width });
            fabric.Image.fromURL(
              data, 
              (image) => {
                canvas.add(image);
                image.center();
                this.setState(assign({ }, this.state, { image, canvas }) as ImagePickerState);
              },
              { width: img.bitmap.width * 1.4, height: img.bitmap.height * 1.4 }
            );
          });
        });
      }

      reader.readAsArrayBuffer(file);
    });
    
  }

  handleTouchTap = (event) => {
    event.preventDefault();
    this.setState(assign({ }, this.state, { open: true, anchorEl: event.currentTarget }) as ImagePickerState);
  };

  handleRequestClose = () => {
    this.setState(assign({ }, this.state, { open: false, anchorEl: null }) as ImagePickerState);
  };

  handleFlip = () => {
    this.state.image.set('flipX', !this.state.image.get('flipX'));
    this.state.canvas.renderAll();
  }

  setBrightness = (event, value) => {
    var filter = new fabric.Image.filters.Brightness({ brightness: value });
    this.state.image.filters[0] = filter;
    this.state.image.applyFilters(this.state.canvas.renderAll.bind(this.state.canvas));
  }

  setInvert = (event, isChecked) => {
    this.setState(assign({ }, this.state, { invert: isChecked }) as ImagePickerState);
    if (isChecked) {
      this.state.image.filters[1] = invertFilter;
    } else {
      this.state.image.filters[1] = null;
    }
    this.state.image.applyFilters(this.state.canvas.renderAll.bind(this.state.canvas));
  }

  addPoint() {

  }

  private pushEdit(image: string, edit: Edit) {
    this.edits.push(edit);
  }

  private performEdits(image, edits) {
    this.setState(assign({ }, this.state, { isEditing: true }) as ImagePickerState);
    this.worker.postMessage({ image, edits });
  }

  componentDidMount() {
    this.worker = new ImageWorker;
    this.listener = e => {
      console.log('Got message from worker', e);
      const patch: any = { modifiedImage: e.data.image };
      if (e.data.isDestructive) {
        patch.originalImage = e.data.image;
      }
      this.setState(assign({ }, this.state, patch, { isEditing: false }) as ImagePickerState);
    };
    this.worker.addEventListener('message', this.listener);
  }

  componentWillUnmount() {
    this.worker && this.worker.removeEventListener('message', this.listener);
  }

  render() {
    const hasImage = this.state.hasImage;
    const cannotEdit = !hasImage || this.state.isEditing;
    return (
      <div className={cx(classes.root, this.props.className)}>
        <div ref="canvasContainer" className={classes.canvas_container}>
          {hasImage ? (
            <canvas
              className={classes.canvas}
              ref="canvas"
              alt="Preview for cephalometric radiograph"
            />
          ) : (
            <Dropzone
              className={classes.dropzone} activeClassName={classes.dropzone__active}
              onDrop={this.handleDrop} multiple={false}
            >
              <div className={classes.dropzone_placeholder}>
                <DropzonePlaceholder className={classes.dropzone_placeholder_image} />
                Drop a cephalometric radiograph here or click to pick one
              </div>
            </Dropzone>
          )}
        </div>
        <div className={classes.toolbar}>
          <Toolbar>
            <ToolbarGroup firstChild>
              <FlatButton onClick={this.addPoint} disabled={cannotEdit} label="Add point" icon={<IconControlPoint />} />
              <FlatButton onClick={this.handleFlip} disabled={cannotEdit} label="Flip" icon={<IconFlip />} />
              <FlatButton
                disabled={cannotEdit}
                label="Corrections" icon={<IconBrightness />}
                onClick={this.handleTouchTap}
              />
              <Popover
                open={this.state.open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'top'}}
                targetOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                onRequestClose={this.handleRequestClose}
              >
                <Slider
                  style={{ width: 200, margin: 15 }}
                  description="Brightness"
                  min={0} max={255}
                  defaultValue={this.state.brightness}
                  onChange={this.setBrightness}
                />
                <Divider />
                <Checkbox label="Invert" checked={this.state.invert} onCheck={this.setInvert} />
              </Popover>
            </ToolbarGroup>
          </Toolbar>
        </div>
      </div>
    );
  }
}