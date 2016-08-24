import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Dropzone from 'react-dropzone';
import { assign } from 'lodash';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle } from 'material-ui/Toolbar';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconBrightness from 'material-ui/svg-icons/image/brightness-5';
import IconControlPoint from 'material-ui/svg-icons/image/control-point';
import IconPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import IconHourglass from 'material-ui/svg-icons/action/hourglass-empty';
import IconDone from 'material-ui/svg-icons/action/done';
import Menu from 'material-ui/Menu';
import { List, ListItem } from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import { ImageWorkerData } from './worker';
import * as cx from 'classnames';
import { fabric } from 'fabric';
import { mapValues, pick } from 'lodash';
import { Landmark, getStepsForAnalysis } from '../../analyses/helpers';
import downs from '../../analyses/downs';
import { descriptions } from './strings';
import { readFileAsBuffer } from '../../utils/file';

require('jimp/browser/lib/jimp.js');
declare const Jimp: any;

const ImageWorker = require('worker!./worker');
const classes = require('./style.scss');
const DropzonePlaceholder = require('./assets/placeholder.svg').default;

function isStepDone(s: Landmark, i: number): boolean {
  return i < 5;
}

function isCurrentStep(s: Landmark, i: number): boolean {
  return i === 5;
}

const ICON_DONE = <IconDone color="green" />;
const ICON_CURRENT = <IconPlayArrow color="blue" />;
const ICON_PENDING = <IconHourglass/>;

function getStepStateIcon(s: Landmark, i: number): JSXElement {
  if (isStepDone(s, i)) {
    return ICON_DONE;
  } else if (isCurrentStep(s, i)) {
    return ICON_CURRENT;
  } else {
    return ICON_PENDING;
  }
}

function getDescriptionForStep(s: Landmark): string | null {
  return descriptions[s.symbol] || s.description || null;
}

function getTitleForStep(s: Landmark): string {
  if (s.type === 'point') {
    return `Set point ${s.symbol} ${ s.name ? `(${s.name})` : '' }`;
  } else if (s.type === 'line') {
    return `Draw line ${s.symbol} ${ s.name ? `(${s.name})` : '' }`;
  } else if (s.type === 'angle') {
    return `Calculate angle ${s.symbol} ${ s.name ? `(${s.name})` : '' }`;
  }
  throw new TypeError(`Cannot handle this type of landmarks (${s.type})`);
}

type Step = Landmark;

interface CephaloEditorProps {
  className: string,
}

interface CephaloEditorState {
  image: Object | null,
  canvas: HTMLCanvasElement | null,
  anchorEl: Element | null,
  hasImage: boolean,
  open: boolean,
  isEditing: boolean,
  brightness: number,
  invert: boolean,
  isAnalysisActive: boolean,
  analysisSteps: Landmark[];
  isAnalysisComplete: boolean;
}

export interface Edit {
  method: string,
  args: Array<any>,
  isDestructive?: boolean,
}

const invertFilter = new fabric.Image.filters.Invert();

export default class CephaloEditor extends React.Component<CephaloEditorProps, CephaloEditorState> {
  private listener: EventListener;
  private worker: ImageWorker;
  private edits: Array<Edit> = [];
  refs: { canvas: Element, canvasContainer: Element };
  state = {
    open: false, anchorEl: null,
    canvas: null, image: null, hasImage: false,
    isEditing: false,
    brightness: 0, invert: false,
    isAnalysisActive: true,
    analysisSteps: getStepsForAnalysis(downs),
  };

  handleDrop = (files: File[]) => {
    const file: File = files[0];
    
    this.setState(assign({ }, this.state, { hasImage: true }) as CephaloEditorState, () => {
      const canvasEl = ReactDOM.findDOMNode(this.refs.canvas);
      const canvasContainerEl = ReactDOM.findDOMNode(this.refs.canvasContainer);
      const { height, width }: any = 
        mapValues(
          pick(window.getComputedStyle(canvasContainerEl), 'height', 'width'),
          dim => Number(dim.replace('px', ''))
        );
      
      readFileAsBuffer(file).then(buff => {
        return Jimp.read(buff).then((img: any) => {
          img.scaleToFit(height * 0.5, width * 0.5).getBase64(Jimp.MIME_BMP, (err, data) => {
            const canvas = new fabric.Canvas(canvasEl, { height, width });
            fabric.Image.fromURL(
              data, 
              (image) => {
                canvas.add(image);
                image.center();
                this.setState(assign({ }, this.state, { image, canvas }) as CephaloEditorState);
              },
              { width: img.bitmap.width * 1.4, height: img.bitmap.height * 1.4 }
            );
          });
        });
      });
    });
    
  }

  handleTouchTap = (event: Event) => {
    event.preventDefault();
    this.setState(assign({ }, this.state, { open: true, anchorEl: event.currentTarget }) as CephaloEditorState);
  };

  handleRequestClose = () => {
    this.setState(assign({ }, this.state, { open: false, anchorEl: null }) as CephaloEditorState);
  };

  handleFlip = () => {
    this.state.image.set('flipX', !this.state.image.get('flipX'));
    this.state.canvas.renderAll();
  }

  setBrightness = (event, value) => {
    const filter = new fabric.Image.filters.Brightness({ brightness: value });
    this.state.image.filters[0] = filter;
    this.state.image.applyFilters(this.state.canvas.renderAll.bind(this.state.canvas));
  }

  setInvert = (event, isChecked) => {
    this.setState(assign({ }, this.state, { invert: isChecked }) as CephaloEditorState);
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
    this.setState(assign({ }, this.state, { isEditing: true }) as CephaloEditorState);
    this.worker.postMessage({ image, edits });
  }

  componentDidMount() {
    this.worker = new ImageWorker;
    this.listener = (e: MessageEvent) => {
      console.log('Got message from worker', e);
      const patch: any = { modifiedImage: e.data.image };
      if (e.data.isDestructive) {
        patch.originalImage = e.data.image;
      }
      this.setState(assign({ }, this.state, patch, { isEditing: false }) as CephaloEditorState);
    };
    this.worker.addEventListener('message', this.listener);
  }

  componentWillUnmount() {
    this.worker && this.worker.removeEventListener('message', this.listener);
  }

  render() {
    const hasImage = this.state.hasImage;
    const cannotEdit = !hasImage || this.state.isEditing;
    const isAnalysisActive = this.state.isAnalysisActive;
    const anaylsisSteps = this.state.analysisSteps;
    const isAnalysisComplete = this.state.isAnalysisComplete;
    return (
      <div className={cx(classes.root, 'row', this.props.className)}>
        <div ref="canvasContainer" className={cx(classes.canvas_container, 'col-xs-12', 'col-sm-8')}>
          {hasImage ? (
            <canvas
              className={classes.canvas}
              ref="canvas"
              alt="Preview for cephalometric radiograph"
            />
          ) : (
            <Dropzone
              className={classes.dropzone}
              activeClassName={classes.dropzone__active}
              rejectClassName={classes.dropzone__reject}
              onDrop={this.handleDrop} multiple={false}
              accept="image/*" disablePreview
            >
              <div className={classes.dropzone_placeholder}>
                <DropzonePlaceholder className={classes.dropzone_placeholder_image} />
                Drop a cephalometric radiograph here or click to pick one
              </div>
            </Dropzone>
          )}
        </div>
        <div className={cx(classes.sidebar, 'col-xs-12', 'col-sm-4')}>
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
          { isAnalysisActive ? (
              <List className={classes.list_steps}> 
                {
                  anaylsisSteps.map((s, i) => (
                    <div key={s.symbol}>
                      <ListItem
                        primaryText={getTitleForStep(s)}
                        secondaryText={getDescriptionForStep(s)}
                        leftIcon={getStepStateIcon(s, i)}
                      />
                    </div>
                  ))
                }
              </List>
            ) : (
              null
            )
          }
          <RaisedButton label="Continue" disabled={!isAnalysisComplete} primary />
        </div>
      </div>
    );
  }
}