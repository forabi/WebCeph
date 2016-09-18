import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import assign from 'lodash/assign';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconBrightness from 'material-ui/svg-icons/image/brightness-5';
import IconControlPoint from 'material-ui/svg-icons/image/control-point';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import cx from 'classnames';
import AnalysisStepper from '../AnalysisStepper';
import CephaloCanvas from '../CephaloCanvas';
import noop from 'lodash/noop';

const classes = require('./style.scss');
const DropzonePlaceholder = require('./assets/placeholder.svg').default;

interface CephaloEditorProps {
  className: string;
  isLoading: boolean;
  isWorkerBusy: boolean;
  isCephalo: boolean;
  src: string | null;
  brightness: number;
  inverted: boolean;
  flipX: boolean;
  flipY: boolean;
  error?: { message: string };
  canvasHeight: number;
  canvasWidth: number;
  isAnalysisActive: boolean;
  isAnalysisComplete: boolean;
  onFlipXClicked(e?: __React.MouseEvent): void;
  onFileDropped(file: File): void;
  onBrightnessChanged(value: number): void;
  onInvertClicked(e?: __React.MouseEvent): void;
  onPickAnotherImageClicked(...args: any[]): void;
  onIgnoreNotCephaloClicked(...args: any[]): void;
  onEditLandmarkClicked(e?: __React.MouseEvent): void;
  onRemoveLandmarkClicked(e?: __React.MouseEvent): void;
}

interface CephaloEditorState {
  anchorEl: Element | null;
  open: boolean,
}

const defaultState: CephaloEditorState = {
  open: false,
  anchorEl: null,
};

export default class CephaloEditor extends React.Component<CephaloEditorProps, CephaloEditorState> {
  refs: { dropzone: Dropzone };
  state = defaultState;

  handleDrop = async (files: File[]) => {
    this.props.onFileDropped(files[0]);
  }

  handleTouchTap = (event: React.MouseEvent) => {
    event.preventDefault();
    this.setState(assign({ }, this.state, { open: true, anchorEl: event.currentTarget }) as CephaloEditorState);
  };

  handleRequestClose = () => {
    this.setState(assign({ }, this.state, { open: false, anchorEl: null }) as CephaloEditorState);
  };

  setBrightness = (__: React.MouseEvent, value: number) => {
    requestAnimationFrame(() => this.props.onBrightnessChanged(value));
  };

  ignoreError = () => this.setState(assign({}, this.state, { error: undefined }));
  resetWorkspace = () => this.setState(defaultState);
  openFilePicker = () => this.refs.dropzone.open();
  ignoreNotCephalo = () => this.setState(assign({ }, this.state, { isCephalo: true }));

  errorDialogActions = [
    <FlatButton label="OK" primary onClick={this.ignoreError} />,
  ];
  notCephaloDialogActions = [
    <FlatButton label="Pick another image" primary onClick={this.props.onPickAnotherImageClicked} />,
    <FlatButton label="Dismiss" onClick={this.props.onIgnoreNotCephaloClicked} />,
  ];

  render() {
    const hasImage = this.props.src !== null;
    const cannotEdit = !hasImage;
    const isAnalysisActive = this.props.isAnalysisActive;
    const isAnalysisComplete = this.props.isAnalysisComplete;
    return (
      <div className={cx(classes.root, 'row', this.props.className)}>
        <div className={cx(classes.canvas_container, 'col-xs-12', 'col-sm-8')}>
          {hasImage ? (
            <div>
              <CephaloCanvas
                className={classes.canvas}
                src={this.props.src}
                brightness={this.props.brightness}
                inverted={this.props.inverted}
                flipX={this.props.flipX}
                flipY={this.props.flipY}
                height={this.props.canvasHeight}
                width={this.props.canvasWidth}
              />
              <Snackbar
                open={this.props.isWorkerBusy}
                message="Still working..." 
                onRequestClose={noop}
              />
              <Dialog
                open={!this.props.isCephalo}
                actions={this.notCephaloDialogActions}
                onRequestClose={this.props.onIgnoreNotCephaloClicked}
              >
                This image does not look like a cephalometric radiograph.
                Would you like to load another image?
              </Dialog>
            </div>
          ) : this.props.isLoading ? (
            <CircularProgress color="white" size={2} />
          ) : this.props.error ? (
            <Dialog
              open title="Error loading image"
              actions={this.errorDialogActions}
              onRequestClose={this.ignoreError}
              style={{ width: '100%' }}
            >
              {this.props.error.message}
            </Dialog>
          ) : (
            <Dropzone ref="dropzone"
              className={classes.dropzone}
              activeClassName={classes.dropzone__active}
              rejectClassName={classes.dropzone__reject}
              onDrop={this.handleDrop}
              multiple={false}
              accept="image/bmp, image/png, image/jpeg"
              disableClick
              disablePreview
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
              <FlatButton onClick={this.props.onFlipXClicked} disabled={cannotEdit} label="Flip" icon={<IconFlip />} />
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
                  defaultValue={this.props.brightness}
                  onChange={this.setBrightness}
                />
                <Divider />
                <Checkbox label="Invert" checked={this.props.inverted} onCheck={this.props.onInvertClicked} />
              </Popover>
            </ToolbarGroup>
          </Toolbar>
          { isAnalysisActive ? (
              <AnalysisStepper
                className={classes.list_steps}
                showResults={this.props.onShowAnalysisResultsClicked}
                editLandmark={this.props.onEditLandmarkClicked}
                removeLandmark={this.props.onRemoveLandmarkClicked}
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