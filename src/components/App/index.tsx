import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { connect } from 'react-redux';
import cx from 'classnames';
import assign from 'lodash/assign';
import attempt from 'lodash/attempt';
import some from 'lodash/some';
import noop from 'lodash/noop';

import CephaloEditor from '../CephaloEditor';
import CompatibilityChecker from '../CompatibilityChecker';
import AnalysisResultsViewer from '../AnalysisResultsViewer';

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
} from '../../store/selectors/workspace';

import {
  getMissingFeatures,
  isBrowserCompatible,
} from '../../store/reducers/env/compatibility';

import {
  getCurrentBrowser,
  getRecommendedBrowsers,
} from '../../store/selectors/env';

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
  onCanvasClicked: (dispatch: Function) => (e: { X: number, Y: number }) => void;
  onFileDropped(dispatch: Function): (file: File) => void;
  getStepValue(step: Step): number | undefined;
  areAnalysisResultsShown: boolean;
  analysisResults: (AnalysisResult & { name: string })[];
}

interface DispatchProps {
  dispatch: Function;
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
}

interface MergeProps {
  onCanvasClicked(e: { X: number, Y: number }): void;
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
  (state: StoreState) => ({
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
    onCanvasClicked: onCanvasClickedSelector(state),
    areAnalysisResultsShown: state['cephalo.workspace.analysis.results.areShown'],
    analysisResults: getAnalysisResultsSelector(state),
  } as StateProps),

  // mapDispatchToProps
  (dispatch: Function) => ({
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
  } as DispatchProps),

  (stateProps: StateProps, dispatchProps: DispatchProps) => assign(
    { },
    stateProps,
    dispatchProps,
    {
      onCanvasClicked: stateProps.onCanvasClicked(dispatchProps.dispatch),
    } as MergeProps
  ) as AppProps
)(App);
