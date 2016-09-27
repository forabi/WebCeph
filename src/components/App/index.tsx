import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { connect } from 'react-redux';
import CephaloEditor from '../CephaloEditor';
import cx from 'classnames';
import assign from 'lodash/assign';
import attempt from 'lodash/attempt';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';
import some from 'lodash/some';
import intersection from 'lodash/intersection';
import map from 'lodash/map';
import find from 'lodash/find';
import has from 'lodash/has';
import memoize from 'lodash/memoize';
import pure from 'recompose/pure';
import {
  flipImageX,
  invertImage,
  setBrightness,
  loadImageFile,
  resetWorkspace,
  ignoreWorkspaceError,
  ignoreLikelyNotCephalo,
  addLandmark,
} from '../../actions/workspace';
import { getStepsForAnalysis } from '../../analyses/helpers';

const classes = require('./style.scss');

require('../../layout/_index.scss');

attempt(injectTapEventPlugin);

interface StateProps {
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
  landmarks: { [id: string]: GeometricalLine | GeometricalPoint } | { };
  error?: { message: string };
  analysisSteps: CephaloLandmark[];
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

interface AdditionalProps { 
  onFileDropped(file: File): void;
  onCanvasClicked(e: fabric.IEvent & { e: MouseEvent }): void;
  expectedNextLandmark: CephaloLandmark | null;
}

type AppProps = StateProps & DispatchProps & AdditionalProps;

const App = pure((props: AppProps) => (
  <MuiThemeProvider>
    <div className={cx('col-xs-12', classes.root)}>
      <CephaloEditor
        className={cx('row', classes.editor)}
        {...props}
      />
    </div>
  </MuiThemeProvider>
));

function getIsAnalysisComplete(setLandmarks: { [id: string]: CephaloLandmark }, activeAnalysis: Analysis | null) {
  if (!activeAnalysis) return false;
  return intersection(
    map(activeAnalysis, x => x.landmark.symbol),
    map(setLandmarks, x => x.symbol),
  ).length > 0;
}

const getExpectedNextLandmark = (
  (
    steps: CephaloLandmark[],
    setLandmarks: { [id: string]: GeometricalLine | GeometricalPoint } | { }
  ) => (find(
    steps,
    x => x.type === 'point' && !has(setLandmarks, x.symbol),
  ) || null) as CephaloLandmark | null
);

const getAnalysisSteps = memoize((analysis: Analysis | null): CephaloLandmark[] => {
  if (analysis !== null) {
    return getStepsForAnalysis(analysis);
  }
  return [];
});

export default connect(
  // mapStateToProps
  (state: StoreState) => ({
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
    isAnalysisActive: (
      state['cephalo.workspace.image.data'] !== null && 
      state['cephalo.workspace.analysis.activeAnalysis'] !== null
    ),
    isAnalysisComplete: getIsAnalysisComplete(
      state['cephalo.workspace.landmarks'],
      state['cephalo.workspace.analysis.activeAnalysis'],
    ),
    error: state['cephalo.workspace.error'],
    landmarks: pickBy(mapValues(state['cephalo.workspace.landmarks'], x => x.mappedTo), Boolean),
    analysisSteps: getAnalysisSteps(state['cephalo.workspace.analysis.activeAnalysis']),
  } as StateProps),

  // mapDispatchToProps
  (dispatch: Function) => ({
    dispatch,
    onFlipXClicked: () => dispatch(flipImageX()),
    onBrightnessChanged: (value: number) => dispatch(setBrightness(value)),
    onInvertClicked: () => dispatch(invertImage()),
    onPickAnotherImageClicked: () => dispatch(resetWorkspace()),
    onIgnoreNotCephaloClicked: () => dispatch(ignoreLikelyNotCephalo()),
    onIgnoreErrorClicked: () => dispatch(ignoreWorkspaceError()),
    onCanvasResized: () => null, // @TODO
    onAddLandmarkRequested: () => null, // @TODO
    onEditLandmarkRequested: () => null, // @TODO
    onRemoveLandmarkRequested: () => null, // @TODO
  } as DispatchProps),

  // mergeProps
  (stateProps: StateProps, dispatchProps: DispatchProps) => {
    const expectedNextLandmark = getExpectedNextLandmark(stateProps.analysisSteps, stateProps.landmarks);
    return assign(
      {},
      stateProps,
      dispatchProps,
      {
        expectedNextLandmark,
        onFileDropped: (file: File) => dispatchProps.dispatch(loadImageFile({
          file,
          height: stateProps.canvasHeight,
          width: stateProps.canvasWidth,
        })),
        onCanvasClicked: e => {
          if (expectedNextLandmark) {
            dispatchProps.dispatch(
              addLandmark(expectedNextLandmark, e.e.offsetX, e.e.offsetY)
            );
          }
        },
      } as AdditionalProps,
    ) as AppProps;
  },
)(App);
