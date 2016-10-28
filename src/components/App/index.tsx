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
import { Tools } from 'utils/constants';

import { ZoomWithWheel, ZoomWithClick, Eraser, AddPoint } from 'actions/tools';

const toolsById: { [id: string]: EditorToolCreator } = {
  [Tools.ERASER]: Eraser,
  [Tools.ADD_POINT]: AddPoint,
  [Tools.ZOOM_WITH_WHEEL]: ZoomWithWheel,
  [Tools.ZOOM_WITH_CLICK]: ZoomWithClick,
};

import {
  flipX,
  invertColors,
  setBrightness,
  setContrast,
  resetWorkspace,
  ignoreWorkspaceError,
  ignoreLikelyNotCephalo,
  showAnalysisResults,
  closeAnalysisResults,
  highlightStep,
  unhighlightStep,
  undo,
  redo,
  setActiveTool,
  loadImageFile,
} from 'actions/workspace';

import {
  activeAnalysisStepsSelector,
  isAnalysisCompleteSelector,
  isAnalysisActiveSelector,
  getAnalysisResultsSelector,
  getAnyStepStateSelector,
  getAllLandmarksSelector,
  getLandmarkValueSelector,
  getComponentsForSymbolSelector,
  canRedoSelector,
  canUndoSelector,
  getActiveToolSelector,
} from 'store/selectors/workspace';

import {
  getMissingFeatures,
  isBrowserCompatible,
} from 'store/reducers/env/compatibility';

import {
  getCurrentBrowser,
  getRecommendedBrowsers,
} from 'store/selectors/env';

import {
  getHighlightedSteps,
} from 'store/reducers/workspace/canvas/highlightedSteps';

import {
  getActiveCursor,
} from 'store/reducers/workspace/cursorStack';

import { checkBrowserCompatibility } from 'actions/initialization';

const classes = require('./style.scss');

require('layout/_index.scss');

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
  areAnalysisResultsShown: boolean;
  analysisResults: ViewableAnalysisResult[];
  highlightedLandmarks: { [symbol: string]: boolean };
  getComponentsForSymbol: (symbol: string) => CephaloLandmark[];
  canRedo: boolean;
  canUndo: boolean;
  activeTool: (dispatch: Function) => EditorTool;
  activeToolId: string | string;
  analysisSteps: CephaloLandmark[];
  activeCursor: string | undefined;
  getStepState(step: Step): StepState;
  getStepValue(step: Step): number | undefined;
}

interface DispatchProps {
  dispatch(action: GenericAction): any;
  onFileDropped(file: File): any;
  onFlipXClicked(e: React.MouseEvent): void;
  onInvertClicked(e: React.MouseEvent): void;
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
  setActiveTool(symbol: string): () => void;
}

interface MergeProps {
  highlightModeOnCanvas: boolean;
  onStepMouseOver(symbol: string): React.EventHandler<React.MouseEvent>;
  onStepMouseOut(symbol: string): React.EventHandler<React.MouseEvent>;
  onCanvasLeftClick?(x: number, y: number): void;
  onCanvasRightClick?(x: number, y: number): void;
  onCanvasMouseWheel?(x: number, y: number, delta: number): void;
  onCanvasMouseEnter?(): void;
  onCanvasMouseLeave?(): void;
  onLandmarkMouseEnter?(symbol: string): void;
  onLandmarkMouseLeave?(symbol: string): void;
  onLandmarkClick?(symbol: string, e: React.MouseEvent): void;
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
};

export default connect(
  // mapStateToProps
  (enhancedState: EnhancedState<StoreState>) => {
    const { present: state } = enhancedState;
    const activeToolId = getActiveToolSelector(state);
    const activeTool = toolsById[activeToolId] === undefined ? null : partial(toolsById[activeToolId], state);
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
      getStepValue: getLandmarkValueSelector(state),
      areAnalysisResultsShown: state['cephalo.workspace.analysis.results.areShown'],
      analysisResults: getAnalysisResultsSelector(state),
      highlightedLandmarks: getHighlightedSteps(state),
      getComponentsForSymbol: getComponentsForSymbolSelector(state),
      canRedo: canRedoSelector(enhancedState),
      canUndo: canUndoSelector(enhancedState),
      activeTool,
      activeToolId,
      activeCursor: getActiveCursor(state),
    } as StateProps;
  },

  // mapDispatchToProps
  (dispatch: DispatchFunction) => ({
    dispatch,
    onFlipXClicked: () => dispatch(flipX()),
    onBrightnessChanged: (value: number) => dispatch(setBrightness(value)),
    onContrastChanged: (value: number) => dispatch(setContrast(value)),
    onInvertClicked: () => dispatch(invertColors()),
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
    setActiveTool: (symbols: string) => () => dispatch(setActiveTool(symbols)),
    onFileDropped: (file: File) => dispatch(loadImageFile(file)),
  } as DispatchProps),

  (stateProps: StateProps, dispatchProps: DispatchProps) => {
    const { dispatch } = dispatchProps;
    const { getComponentsForSymbol: getComponents } = stateProps;
    const activeTool: EditorTool = stateProps.activeTool !== null ? stateProps.activeTool(dispatch) : { };
    return assign(
      { },
      stateProps,
      dispatchProps,
      activeTool,
      {
        highlightModeOnCanvas: !isEmpty(stateProps.highlightedLandmarks),
        onStepMouseOver: (symbol: string) => () => {
          const symbols = map(getComponents(symbol), c => c.symbol);
          dispatch(highlightStep(symbols));
        },
        onStepMouseOut: (symbol: string) => () => {
          const symbols = map(getComponents(symbol), c => c.symbol);
          dispatch(unhighlightStep(symbols));
        },
      } as MergeProps
    ) as AppProps
  }
)(App);
