import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { connect } from 'react-redux';
import CephaloEditor from '../CephaloEditor';
import cx from 'classnames';
import attempt from 'lodash/attempt';
import some from 'lodash/some';
import throttle from 'lodash/throttle';
import pure from 'recompose/pure';
import noop from 'lodash/noop'
import {
  flipImageX,
  invertImage,
  setBrightness,
  resetWorkspace,
  ignoreWorkspaceError,
  ignoreLikelyNotCephalo,
} from '../../actions/workspace';

import {
  activeAnalysisStepsSelector,
  isAnalysisCompleteSelector,
  isAnalysisActiveSelector,
  getStepStateSelector,
  onCanvasClickedSelector,
  onFileDroppedSelector,
  mappedLandmarksSelector,
} from '../../store/selectors/workspace';

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
  isBrowserCompatible: boolean;
  missingBrowserFeatures: MissingBrowserFeature[];
  currentBrowser: Browser;
  recommendedBrowsers: BrowserRecommendation[];
  onCompatibilityDialogClosed: () => void;
  src: string | null;
  flipX: boolean;
  flipY: boolean;
  brightness: number;
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
  getStepState(step: Step): stepState;
  onCanvasClicked(dispatch: Function): (e: fabric.IEvent & { e: MouseEvent }) => void;
  onFileDropped(dispatch: Function): (file: File) => void;
}

interface DispatchProps {
  dispatch: Function;
  onFlipXClicked(e: __React.MouseEvent): void;
  onInvertClicked(e: __React.MouseEvent): void;
  onBrightnessChanged(value: number): void;
  onPickAnotherImageClicked(...args: any[]): void;
  onIgnoreNotCephaloClicked(...args: any[]): void;
  onIgnoreErrorClicked(...args: any[]): void;
  onAddLandmarkRequested(landmark: CephaloLandmark): void;
  onEditLandmarkRequested(landmark: CephaloLandmark): void;
  onRemoveLandmarkRequested(landmark: CephaloLandmark): void;
  onCanvasResized(e: ResizeObserverEntry): void;
}

type AppProps = StateProps & DispatchProps;

import CompatibilityChecker from '../CompatibilityChecker';


class App extends React.Component<AppProps, {}> {
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
            open={props.shouldCheckBrowserCompatiblity && props.isBrowserCompatible}
            missingFeatures={props.missingBrowserFeatures}
            currentBrowser={props.currentBrowser}
            recommendedBrowsers={props.recommendedBrowsers}
            onDialogClosed={props.onCompatibilityDialogClosed}
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
    missingBrowserFeatures: state['env.compatiblity.missingFeatures'],
    isBrowserCompatible: state['env.compatiblity.missingFeatures'].length > 0,
    currentBrowser: getCurrentBrowser(),
    recommendedBrowsers: getRecommendedBrowsers(),
    onCompatibilityDialogClosed: noop,
    flipX: state['cephalo.workspace.image.flipX'],
    flipY: state['cephalo.workspace.image.flipY'],
    brightness: state['cephalo.workspace.image.brightness'],
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
    landmarks: mappedLandmarksSelector(state),
    analysisSteps: activeAnalysisStepsSelector(state),
    getStepState: getStepStateSelector(state),
    onCanvasClicked: onCanvasClickedSelector(state),
    onFileDropped: onFileDroppedSelector(state),
  } as StateProps),

  // mapDispatchToProps
  (dispatch: Function) => ({
    dispatch,
    onFlipXClicked: () => dispatch(flipImageX()),
    onBrightnessChanged: throttle((value: number) => dispatch(setBrightness(value)), 200),
    onInvertClicked: () => dispatch(invertImage()),
    onPickAnotherImageClicked: () => dispatch(resetWorkspace()),
    onIgnoreNotCephaloClicked: () => dispatch(ignoreLikelyNotCephalo()),
    onIgnoreErrorClicked: () => dispatch(ignoreWorkspaceError()),
    onCanvasResized: () => null, // @TODO
    onAddLandmarkRequested: () => null, // @TODO
    onEditLandmarkRequested: () => null, // @TODO
    onRemoveLandmarkRequested: () => null, // @TODO,
  } as DispatchProps),
)(pure(App));
