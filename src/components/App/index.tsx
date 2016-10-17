import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { connect } from 'react-redux';
import cx from 'classnames';
import assign from 'lodash/assign';
import attempt from 'lodash/attempt';
import some from 'lodash/some';
import noop from 'lodash/noop';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import partial from 'lodash/partial';
import filter from 'lodash/filter';
import { Tools } from '../../utils/constants';

import CephaloEditor from '../CephaloEditor';
import CompatibilityChecker from '../CompatibilityChecker';
import AnalysisResultsViewer from '../AnalysisResultsViewer';

import { createCompositeTool, Zoom, Eraser, AddPoint } from '../../actions/tools';

const toolsById: { [id: string]: EditorToolCreator } = {
  [Tools.ERASER]: Eraser,
  [Tools.ADD_POINT]: AddPoint,
  [Tools.ZOOM]: Zoom,
}

const toolsByPriority = [
  Tools.ERASER,
  Tools.ADD_POINT,
  Tools.ZOOM
];

import {
  flipImageX,
  invertImage,
  setBrightness,
  setContrast,
  resetWorkspace,
  ignoreWorkspaceError,
  ignoreLikelyNotCephalo,
  showAnalysisResults,
  closeAnalysisResults,
  highlightStepsOnCanvas,
  unhighlightStepsOnCanvas,
  undo,
  redo,
} from '../../actions/workspace';

import {
  activeAnalysisStepsSelector,
  isAnalysisCompleteSelector,
  isAnalysisActiveSelector,
  getAnalysisResultsSelector,
  getAnyStepStateSelector,
  onCanvasClickedSelector,
  onFileDroppedSelector,
  getAllLandmarksSelector,
  getLandmarkValueSelector,
  getComponentsForSymbolSelector,
  canRedoSelector,
  canUndoSelector,
  activeToolsSelector,
  getZoomSelector,
  getCanvasZoomOffsetSelector,
} from '../../store/selectors/workspace';

import {
  getMissingFeatures,
  isBrowserCompatible,
} from '../../store/reducers/env/compatibility';

import {
  getCurrentBrowser,
  getRecommendedBrowsers,
} from '../../store/selectors/env';

import {
  getHighlightedSteps,
} from '../../store/reducers/workspace/highlightedSteps';

import { checkBrowserCompatibility } from '../../actions/initialization';

const classes = require('./style.scss');

require('../../layout/_index.scss');

attempt(injectTapEventPlugin);

interface StateProps {
  shouldCheckBrowserCompatiblity: boolean;
  isCheckingCompatiblity: boolean;
  isBrowserCompatible: boolean;
  missingBrowserFeatures: MissingBrowserFeature[];
  currentBrowser: Browser;
  recommendedBrowsers: BrowserRecommendation[];
  onCompatibilityDialogClosed: () => void;
  src: string | null;
  flipX: boolean;
  flipY: boolean;
  brightness: number;
  contrast: number;
  inverted: boolean;
  isLoading: boolean;
  isWorkerBusy: boolean;
  isCephalo: boolean;
  canvasHeight: number;
  canvasWidth: number;
  isAnalysisActive: boolean;
  isAnalysisComplete: boolean;
  landmarks: { [id: string]: GeometricalObject } | { };
  error?: { message: string };
  analysisSteps: CephaloLandmark[];
  getStepState(step: Step): StepState;
  onFileDropped(dispatch: Function): (file: File) => void;
  getStepValue(step: Step): number | undefined;
  areAnalysisResultsShown: boolean;
  analysisResults: ViewableAnalysisResult[];
  highlightedLandmarks: { [symbol: string]: boolean };
  getComponentsForSymbol: (symbol: string) => CephaloLandmark[];
  canRedo: boolean;
  canUndo: boolean;
  canvasZoom: number;
  canvasZoomX: number;
  canvasZoomY: number;
}

interface DispatchProps {
  dispatch: Function;
  activeTool: EditorTool;
  onFlipXClicked(e: __React.MouseEvent): void;
  onInvertClicked(e: __React.MouseEvent): void;
  onBrightnessChanged(value: number): void;
  onContrastChanged(value: number): void;
  onPickAnotherImageClicked(...args: any[]): void;
  onIgnoreNotCephaloClicked(...args: any[]): void;
  onIgnoreErrorClicked(...args: any[]): void;
  onAddLandmarkRequested(landmark: CephaloLandmark): void;
  onEditLandmarkRequested(landmark: CephaloLandmark): void;
  onRemoveLandmarkRequested(landmark: CephaloLandmark): void;
  onCanvasResized(e: ResizeObserverEntry): void;
  onShowAnalysisResultsClicked(): any;
  onAnalysisViewerCloseRequested(): any;
  performUndo(): any;
  performRedo(): any;
}

interface MergeProps {
  onCanvasClicked(x: number, y: number): void;
  highlightModeOnCanvas: boolean;
  onStepMouseOver(symbol: string): __React.EventHandler<__React.MouseEvent>;
  onStepMouseOut(symbol: string): __React.EventHandler<__React.MouseEvent>;
  onCanvasLeftClick?(x: number, y: number): void;
  onCanvasRightClick?(x: number, y: number): void;
  onCanvasMouseWheel?(x: number, y: number, delta: number): void;
  onCanvasMouseEnter?(): void;
  onCanvasMouseLeave?(): void;
  onLandmarkMouseEnter(symbol: string): void;
  onLandmarkMouseLeave(symbol: string): void;
  onLandmarkClick(symbol: string, e: React.MouseEvent): void;
}

type AppProps = StateProps & DispatchProps & MergeProps;

class App extends React.PureComponent<AppProps, {}> {
  componentDidMount() {
    if (this.props.shouldCheckBrowserCompatiblity) {
      this.props.dispatch(checkBrowserCompatibility());
    }
  }

  render() {
    const props = this.props;
    return (
      <MuiThemeProvider>
        <div className={cx('col-xs-12', classes.root)}>
          <CompatibilityChecker
            open={
              props.shouldCheckBrowserCompatiblity && (
                props.isCheckingCompatiblity || !props.isBrowserCompatible
              )
            }
            missingFeatures={props.missingBrowserFeatures}
            currentBrowser={props.currentBrowser}
            recommendedBrowsers={props.recommendedBrowsers}
            onDialogClosed={props.onCompatibilityDialogClosed}
            isChecking={props.isCheckingCompatiblity}
          />
          <AnalysisResultsViewer
            open={props.areAnalysisResultsShown}
            results={props.analysisResults}
            onCloseRequested={props.onAnalysisViewerCloseRequested}
          />
          <CephaloEditor
            className={cx('row', classes.editor)}
            {...props}
          />
        </div>
      </MuiThemeProvider>
    );
  };
}

export default connect(
  // mapStateToProps
  (enhancedState: EnhancedState<StoreState>) => {
    const { present: state } = enhancedState;
    const activeTools = map(filter(
      toolsByPriority,
      (toolId: string) => activeToolsSelector(state)[toolId] === true
    ), (id: string) => toolsById[id]);
    const activeTool = partial(createCompositeTool, activeTools, state);
    const { x: canvasZoomX, y: canvasZoomY } = getCanvasZoomOffsetSelector(state);
    return {
      shouldCheckBrowserCompatiblity: !state['env.compatiblity.isIgnored'],
      isCheckingCompatiblity: state['env.compatiblity.isBeingChecked'],
      missingBrowserFeatures: getMissingFeatures(state),
      isBrowserCompatible: isBrowserCompatible(state),
      currentBrowser: getCurrentBrowser(),
      recommendedBrowsers: getRecommendedBrowsers(),
      onCompatibilityDialogClosed: noop,
      flipX: state['cephalo.workspace.image.flipX'],
      flipY: state['cephalo.workspace.image.flipY'],
      brightness: state['cephalo.workspace.image.brightness'],
      contrast: state['cephalo.workspace.image.contrast'],
      inverted: state['cephalo.workspace.image.invert'],
      isLoading: state['cephalo.workspace.image.isLoading'],
      isWorkerBusy: some(state['cephalo.workspace.workers'], 'isBusy'),
      src: state['cephalo.workspace.image.data'],
      isCephalo: state['cephalo.workspace.image.isCephalo'],
      canvasHeight: state['cephalo.workspace.canvas.height'],
      canvasWidth: state['cephalo.workspace.canvas.width'],
      isAnalysisActive: isAnalysisActiveSelector(state),
      isAnalysisComplete: isAnalysisCompleteSelector(state),
      error: state['cephalo.workspace.error'],
      landmarks: getAllLandmarksSelector(state),
      analysisSteps: activeAnalysisStepsSelector(state),
      getStepState: getAnyStepStateSelector(state),
      onFileDropped: onFileDroppedSelector(state),
      getStepValue: getLandmarkValueSelector(state),
      areAnalysisResultsShown: state['cephalo.workspace.analysis.results.areShown'],
      analysisResults: getAnalysisResultsSelector(state),
      highlightedLandmarks: getHighlightedSteps(state),
      getComponentsForSymbol: getComponentsForSymbolSelector(state),
      canRedo: canRedoSelector(enhancedState),
      canUndo: canUndoSelector(enhancedState),
      canvasZoom: getZoomSelector(state),
      canvasZoomX,
      canvasZoomY,
      activeTool,
    } as StateProps;
  },

  // mapDispatchToProps
  (dispatch: DispatchFunction) => ({
    dispatch,
    onFlipXClicked: () => dispatch(flipImageX()),
    onBrightnessChanged: (value: number) => dispatch(setBrightness(value)),
    onContrastChanged: (value: number) => dispatch(setContrast(value)),
    onInvertClicked: () => dispatch(invertImage()),
    onPickAnotherImageClicked: () => dispatch(resetWorkspace()),
    onIgnoreNotCephaloClicked: () => dispatch(ignoreLikelyNotCephalo()),
    onIgnoreErrorClicked: () => dispatch(ignoreWorkspaceError()),
    onCanvasResized: () => null, // @TODO
    onAddLandmarkRequested: () => null, // @TODO
    onEditLandmarkRequested: () => null, // @TODO
    onRemoveLandmarkRequested: () => null, // @TODO,
    onShowAnalysisResultsClicked: () => dispatch(showAnalysisResults()),
    onAnalysisViewerCloseRequested: () => dispatch(closeAnalysisResults()),
    performUndo: () => dispatch(undo()),
    performRedo: () => dispatch(redo()),
  } as DispatchProps),

  (stateProps: StateProps, dispatchProps: DispatchProps) => {
    const { dispatch } = dispatchProps;
    const { getComponentsForSymbol: getComponents } = stateProps;
    const activeTool: EditorTool = stateProps.activeTool(dispatch);
    return assign(
      { },
      stateProps,
      dispatchProps,
      {
        onCanvasClicked: activeTool.onCanvasLeftClick,
        onCanvasMouseWheel: activeTool.onCanvasMouseWheel,
        onCanvasRightClick: activeTool.onCanvasRightClick,
        onCanvasLeftClick: activeTool.onCanvasLeftClick,
        onCanvasMouseEnter: activeTool.onCanvasMouseEnter,
        onCanvasMouseLeave: activeTool.onCanvasMouseLeave,
        onLandmarkMouseEnter: activeTool.onLandmarkMouseEnter,
        onLandmarkMouseLeave: activeTool.onLandmarkMouseLeave,
        onLandmarkClick: activeTool.onLandmarkClick,
        highlightModeOnCanvas: !isEmpty(stateProps.highlightedLandmarks),
        onStepMouseOver: (symbol: string) => () => {
          const symbols = map(getComponents(symbol), c => c.symbol);
          dispatch(highlightStepsOnCanvas(symbols));
        },
        onStepMouseOut: (symbol: string) => () => {
          const symbols = map(getComponents(symbol), c => c.symbol);
          dispatch(unhighlightStepsOnCanvas(symbols));
        },
        activeTool,
      } as MergeProps
    ) as AppProps
  }
)(App);
