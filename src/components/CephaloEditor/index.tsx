import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Dropzone from 'react-dropzone';
import assign from 'lodash/assign';
import mapValues from 'lodash/mapValues';
import pick from 'lodash/pick';
import uniqueId from 'lodash/uniqueId';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup} from 'material-ui/Toolbar';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconBrightness from 'material-ui/svg-icons/image/brightness-5';
import IconControlPoint from 'material-ui/svg-icons/image/control-point';
import Menu from 'material-ui/Menu';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import { List, ListItem } from 'material-ui/List';
import MenuItem from 'material-ui/MenuItem';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import { IImageWorker, WorkerRequest, WorkerError, WorkerEvent, Edit } from './worker';
import * as cx from 'classnames';
import { Landmark, getStepsForAnalysis } from '../../analyses/helpers';
import downs from '../../analyses/downs';
import { descriptions } from './strings';
import AnalysisStepper from '../AnalysisStepper';
import CephaloCanvas from '../CephaloCanvas';


const ImageWorker = require('worker!./worker');
const classes = require('./style.scss');
const DropzonePlaceholder = require('./assets/placeholder.svg').default;

function isStepDone(__: Landmark, i: number): boolean {
  return i < 5;
}

function isCurrentStep(__: Landmark, i: number): boolean {
  return i === 5;
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

interface CephaloEditorProps {
  className: string,
}

interface CephaloEditorState {
  url?: string,
  canvas: HTMLCanvasElement | null,
  anchorEl: Element | null,
  isLoading: boolean,
  error?: WorkerError,
  open: boolean,
  isEditing: boolean,
  containerHeight: number,
  containerWidth: number,
  brightness: number,
  invert: boolean,
  flipX: boolean; flipY: boolean;
  isAnalysisActive: boolean,
  analysisSteps: Landmark[];
  isAnalysisComplete: boolean;
}

export interface Edit {
  method: string,
  args: Array<any>,
  isDestructive?: boolean,
}

export default class CephaloEditor extends React.Component<CephaloEditorProps, CephaloEditorState> {
  private listener: EventListener;
  private worker: IImageWorker;
  refs: { canvas: Element, canvasContainer: Element, dropzone: Dropzone };
  state = {
    open: false, anchorEl: null,
    canvas: null,
    isEditing: false,
    isLoading: false,
    error: undefined,
    brightness: 0, invert: false,
    flipX: false, flipY: false,
    isAnalysisActive: true,
    isAnalysisComplete: false,
    analysisSteps: getStepsForAnalysis(downs),
    containerHeight: 0,
    containerWidth: 0,
    url: undefined,
  };

  handleDrop = (files: File[]) => {
    const file: File = files[0];
    
    this.setState(assign({ }, this.state, { isLoading: true }) as CephaloEditorState, () => {
      const canvasContainerEl = ReactDOM.findDOMNode(this.refs.canvasContainer);
      const { height, width }: any = 
        mapValues(
          pick(window.getComputedStyle(canvasContainerEl), 'height', 'width'),
          dim => Number(dim.replace('px', ''))
        );
      
      this.setState(assign({ }, this.state, { containerHeight: height, containerWidth: width }), () => {
        const requestId = uniqueId('action_');
        this.listener = ({ data }: WorkerEvent) => {
          if (data.requestId === requestId) {
            if (data.error) {
              this.setState(assign({}, this.state, { error: data.error, isLoading: false }));
            } else {
              this.setState(assign({}, this.state, { url: data.url, error: undefined, isLoading: false }));
            }
            this.worker.removeEventListener('message', this.listener);
          }
        }
        
        this.worker.addEventListener('message', this.listener);

        this.worker.postMessage({
          id: requestId,
          file,
          edits: [{
            method: 'scaleToFit',
            args: [height, width],
          }]
        });
      });
    });
  }

  handleTouchTap = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState(assign({ }, this.state, { open: true, anchorEl: event.currentTarget }) as CephaloEditorState);
  };

  handleRequestClose = () => {
    this.setState(assign({ }, this.state, { open: false, anchorEl: null }) as CephaloEditorState);
  };

  handleFlipX = () => {
    this.setState(assign({}, this.state, { flipX: !this.state.flipX }));
  }

  handleFlipY = () => {
    this.setState(assign({}, this.state, { flipY: !this.state.flipY }));
  }

  setBrightness = (__: React.MouseEvent, value: number) => {
    this.setState(assign({}, this.state, { brightness: value }));
  }

  setInvert = (__: React.MouseEvent, isChecked: boolean) => {
    this.setState(assign({}, this.state, { invert: isChecked }));
  }

  addPoint() {

  }

  componentDidMount() {
    this.worker = new ImageWorker;
  }

  componentWillUnmount() {
    this.worker && this.worker.removeEventListener('message', this.listener);
  }

  ignoreError = () => this.setState(assign({}, this.state, { error: undefined }));
  actions = [
    <FlatButton label="OK" primary onClick={this.ignoreError} />
  ];

  openFilePicker = () => this.refs.dropzone.open();

  render() {
    const hasImage = !!this.state.url;
    const cannotEdit = !hasImage || this.state.isEditing;
    const isAnalysisActive = hasImage;
    const anaylsisSteps = this.state.analysisSteps;
    const isAnalysisComplete = this.state.isAnalysisComplete;
    const hasError = !!this.state.error;
    const { isLoading } = this.state;  
    return (
      <div className={cx(classes.root, 'row', this.props.className)}>
        <div ref="canvasContainer" className={cx(classes.canvas_container, 'col-xs-12', 'col-sm-8')}>
          {hasImage ? (
            <CephaloCanvas
              className={classes.canvas}
              src={this.state.url}
              brightness={this.state.brightness}
              inverted={this.state.invert}
              flipX={this.state.flipX}
              flipY={this.state.flipY}
              height={this.state.containerHeight}
              width={this.state.containerWidth}
            />
          ) : isLoading ? (
            <CircularProgress color="white" size={2} />
          ) : hasError ? (
            <Dialog
              open title="Error loading image"
              actions={this.actions}
              onRequestClose={this.ignoreError}
              style={{ width: '100%' }}
            >
              {this.state.error.message}
            </Dialog>
          ) : (
            <Dropzone ref="dropzone"
              className={classes.dropzone}
              activeClassName={classes.dropzone__active}
              rejectClassName={classes.dropzone__reject}
              onDrop={this.handleDrop} multiple={false}
              disableClick
              accept="image/bmp,image/png,image/jpeg" disablePreview
            >
              <div className={classes.dropzone_placeholder}>
                <DropzonePlaceholder className={classes.dropzone_placeholder_image} />
                <span className={classes.dropzone_placeholder_text}>
                  To start tracing, drop a cephalometric radiograph here or
                </span>
                <RaisedButton onClick={this.openFilePicker} primary label="Click to pick an image" />
              </div>
            </Dropzone>
          )}
        </div>
        <div className={cx(classes.sidebar, 'col-xs-12', 'col-sm-4')}>
          <Toolbar>
            <ToolbarGroup firstChild>
              <FlatButton onClick={this.addPoint} disabled={cannotEdit} label="Add point" icon={<IconControlPoint />} />
              <FlatButton onClick={this.handleFlipX} disabled={cannotEdit} label="Flip" icon={<IconFlip />} />
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
              <AnalysisStepper
                className={classes.list_steps}
                steps={anaylsisSteps}
                showResults={() => alert('results!')}
                currentStep={6}
                isAnalysisComplete={isAnalysisComplete}
                isStepDone={isStepDone}
                getDescriptionForStep={getDescriptionForStep}
                getTitleForStep={getTitleForStep}
                editLandmark={() => null}
                removeLandmark={() => null}
              />
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