import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import { findDOMNode } from 'react-dom'; 
import assign from 'lodash/assign';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import Popover from 'material-ui/Popover';
import Slider from 'material-ui/Slider';
import IconFlip from 'material-ui/svg-icons/image/flip';
import IconBrightness from 'material-ui/svg-icons/image/brightness-5';
import IconUndo from 'material-ui/svg-icons/content/undo';
import IconRedo from 'material-ui/svg-icons/content/redo';
import IconEraser from 'material-ui/svg-icons/content/remove-circle-outline';
import IconAddPoint from 'material-ui/svg-icons/image/control-point';
import IconZoom from 'material-ui/svg-icons/action/zoom-in';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';
import Snackbar from 'material-ui/Snackbar';
import Divider from 'material-ui/Divider';
import Checkbox from 'material-ui/Checkbox';
import cx from 'classnames';
import AnalysisStepper from '../AnalysisStepper';
import CephaloCanvas from '../CephaloCanvas/connected';
import noop from 'lodash/noop';
import throttle from 'lodash/throttle';
import { Tools } from '../../utils/constants';
import { resizeCanvas } from '../../actions/workspace';

const classes: any = require('./style.scss');
const DropzonePlaceholder: (props: any) => JSX.Element = require(
  'svg-react?name=DropzonePlaceholder!svgo?useConfig=svgoConfig!./assets/placeholder.svg'
);

export interface CephaloEditorProps {
  dispatch: Function;
  className: string;
  isLoading: boolean;
  isWorkerBusy: boolean;
  isCephalo: boolean;
  src: string | null;
  landmarks: { [id: string]: GeometricalObject } | { };
  brightness: number;
  contrast: number;
  inverted: boolean;
  flipX: boolean;
  flipY: boolean;
  error?: { message: string };
  isAnalysisActive: boolean;
  isAnalysisComplete: boolean;
  analysisSteps: Step[];
  highlightModeOnCanvas: boolean;
  highlightedLandmarks: { [symbol: string]: boolean };
  activeToolId: string | null;
  canRedo: boolean;
  canUndo: boolean;
  activeCursor: string;
  onFlipXClicked(e?: React.MouseEvent<any>): void;
  onFileDropped(dispatch: Function): (file: File) => void;
  onBrightnessChanged(value: number): void;
  onContrastChanged(value: number): void;
  onInvertClicked(e?: React.MouseEvent<any>): void;
  onPickAnotherImageClicked(...args: any[]): void;
  onIgnoreNotCephaloClicked(...args: any[]): void;
  onShowAnalysisResultsClicked(): any;
  onEditLandmarkRequested(landmark: CephaloLandmark): void;
  onRemoveLandmarkRequested(landmark: CephaloLandmark): void;
  onIgnoreErrorClicked(...args: any[]): void;
  onCanvasResized(e: ResizeObserverEntry): void;
  onCanvasLeftClick(x: number, y: number): void;
  onCanvasRightClick(x: number, y: number): void;
  onLandmarkMouseEnter(symbol: string): void;
  onLandmarkMouseLeave(symbol: string): void;
  onLandmarkClick(symbol: string): void;
  getStepState(step: Step): StepState;
  getStepValue(step: Step): number | undefined;
  onStepMouseOver(symbol: string): React.EventHandler<React.MouseEvent<any>>;
  onStepMouseOut(symbol: string): React.EventHandler<React.MouseEvent<any>>;
  performUndo(): any;
  performRedo(): any;
  setActiveTool(symbol: string): () => void;
}

interface CephaloEditorState {
  open: boolean,
  anchorEl?: Element;
}

const defaultState: CephaloEditorState = {
  open: false,
};

class CephaloEditor extends React.PureComponent<CephaloEditorProps, CephaloEditorState> {
  refs: {
    canvasContainer: React.ReactInstance,
    dropzone: React.ReactInstance & { open: () => void; }
  };
  state = defaultState;

  ro: ResizeObserver;

  handleResize = throttle((entries: ResizeObserverEntry[]) => {
    for (let entry of entries) {
      this.props.dispatch(resizeCanvas(entry.contentRect.width, entry.contentRect.height));
    }
  }, 120);

  componentDidMount() {
    this.ro = new ResizeObserver(this.handleResize);
    this.ro.observe(findDOMNode(this.refs.canvasContainer));
  };

  componentWillUnmount() {
    this.handleResize.cancel();
    this.ro.unobserve(findDOMNode(this.refs.canvasContainer));
  }

  handleDrop = (files: File[]) => {
    this.props.onFileDropped(this.props.dispatch)(files[0]);
  }

  handleTouchTap = (event: React.MouseEvent<any>) => {
    event.preventDefault();
    this.setState(assign({ }, this.state, { open: true, anchorEl: event.currentTarget }) as CephaloEditorState);
  };

  handleRequestClose = () => {
    this.setState(assign({ }, this.state, { open: false, anchorEl: null }) as CephaloEditorState);
  };

  setBrightness = (__: React.MouseEvent<any>, value: number) => {
    this.props.onBrightnessChanged(value);
  };

  setContrast = (__: React.MouseEvent<any>, value: number) => {
    this.props.onContrastChanged(value);
  };

  openFilePicker = () => this.refs.dropzone.open();

  errorDialogActions = [
    <FlatButton label="Pick another image" primary onClick={this.props.onPickAnotherImageClicked} />,
    <FlatButton label="Dismiss" primary onClick={this.props.onIgnoreErrorClicked} />,
  ];
  notCephaloDialogActions = [
    <FlatButton label="Pick another image" primary onClick={this.props.onPickAnotherImageClicked} />,
    <FlatButton label="Dismiss" onClick={this.props.onIgnoreNotCephaloClicked} />,
  ];

  private performUndo = () => {
    this.props.performUndo();
  };

  private performRedo = () => {
    this.props.performRedo();
  };

  render() {
    const hasImage = this.props.src !== null;
    const cannotEdit = !hasImage;
    const { canUndo, canRedo, isAnalysisComplete, isAnalysisActive } = this.props;
    return (
      <div className={cx(classes.root, 'row', this.props.className)}>
        <div ref="canvasContainer" className={cx(classes.canvas_container, 'col-xs-12', 'col-sm-8')}>
          {hasImage ? (
            <div>
              <CephaloCanvas
                className={classes.canvas}
                src={this.props.src as string}
                brightness={this.props.brightness}
                contrast={this.props.contrast}
                inverted={this.props.inverted}
                flipX={this.props.flipX}
                flipY={this.props.flipY}
                onResized={this.props.onCanvasResized}
                onLeftClick={this.props.onCanvasLeftClick}
                onRightClick={this.props.onCanvasRightClick}
                onMouseWheel={this.props.onCanvasMouseWheel}
                onMouseEnter={this.props.onCanvasMouseEnter}
                onMouseLeave={this.props.onCanvasMouseLeave}
                cursor={this.props.activeCursor}
                onLandmarkClick={this.props.onLandmarkClick}
                onLandmarkMouseEnter={this.props.onLandmarkMouseEnter}
                onLandmarkMouseLeave={this.props.onLandmarkMouseLeave}
                landmarks={this.props.landmarks}
                highlightedLandmarks={this.props.highlightedLandmarks}
                highlightMode={this.props.highlightModeOnCanvas}
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
              onRequestClose={this.props.onIgnoreErrorClicked}
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
          { isAnalysisActive ? (
              <AnalysisStepper
                className={classes.list_steps}
                editLandmark={this.props.onRemoveLandmarkRequested}
                removeLandmark={this.props.onRemoveLandmarkRequested}
                steps={this.props.analysisSteps}
                getStepState={this.props.getStepState}
                getStepValue={this.props.getStepValue}
                onStepMouseOver={this.props.onStepMouseOver}
                onStepMouseOut={this.props.onStepMouseOut}
              />
            ) : (
              <div className={classes.list_steps} />
            )
          }
          <RaisedButton label="Show results" onClick={this.props.onShowAnalysisResultsClicked} disabled={!isAnalysisComplete} primary />
        </div>
        <Toolbar className={cx(classes.toolbar, 'col-xs-12')}>
          <ToolbarGroup firstChild>
            <FlatButton onClick={this.performUndo} disabled={cannotEdit || !canUndo} label="Undo" icon={<IconUndo />} />
            <FlatButton onClick={this.performRedo} disabled={cannotEdit || !canRedo} label="Redo" icon={<IconRedo />} />
            <FlatButton onClick={this.props.onFlipXClicked} disabled={cannotEdit} label="Flip" icon={<IconFlip />} />
            <FlatButton
              disabled={cannotEdit || this.props.activeToolId === Tools.ERASER}
              label="" icon={<IconEraser />}
              onClick={this.props.setActiveTool(Tools.ERASER)}
            />
            <FlatButton
              disabled={cannotEdit || this.props.activeToolId === Tools.ADD_POINT}
              label="" icon={<IconAddPoint />}
              onClick={this.props.setActiveTool(Tools.ADD_POINT)}
            />
            <FlatButton
              disabled={true || cannotEdit || this.props.activeToolId === Tools.ZOOM_WITH_CLICK}
              label="" icon={<IconZoom />}
              onClick={this.props.setActiveTool(Tools.ZOOM_WITH_CLICK)}
            />
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
              Brightness
              <Slider
                style={{ width: 200, margin: 15 }}
                min={0} max={100}
                defaultValue={this.props.brightness}
                onChange={this.setBrightness}
              />
              Contrast
              <Slider
                style={{ width: 200, margin: 15 }}
                min={-100} max={100}
                defaultValue={this.props.contrast}
                onChange={this.setContrast}
              />
              <Divider />
              <Checkbox label="Invert" checked={this.props.inverted} onCheck={this.props.onInvertClicked} />
            </Popover>
          </ToolbarGroup>
        </Toolbar>
      </div>
    );
  }
}

export default CephaloEditor;