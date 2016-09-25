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
  onCanvasClicked(e: fabric.IEvent & { e: MouseEvent }): void;
}

type AppProps = StateProps & DispatchProps & { 
  onFileDropped(file: File): void;
};

const App = (props: AppProps) => (
  <MuiThemeProvider>
    <div className={cx('col-xs-12', classes.root)}>
      <CephaloEditor
        className={cx('row', classes.editor)}
        {...props}
      />
    </div>
  </MuiThemeProvider>
);

import { Na } from '../../analyses/common';

function isAnalysisComplete(setLandmarks: { [id: string]: CephaloLandmark }, activeAnalysis: Analysis | null) {
  if (!activeAnalysis) return false;
  return intersection(
    map(activeAnalysis, x => x.landmark.symbol),
    map(setLandmarks, x => x.symbol),
  ).length > 0;
}

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
    isAnalysisActive: state['cephalo.workspace.analysis.activeAnalysis'] !== null,
    isAnalysisComplete: isAnalysisComplete(
      state['cephalo.workspace.landmarks'],
      state['cephalo.workspace.analysis.activeAnalysis'],
    ),
    error: state['cephalo.workspace.error'],
    landmarks: pickBy(mapValues(state['cephalo.workspace.landmarks'], x => x.mappedTo), Boolean),
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
    onCanvasClicked: e => {
      console.log('Canvas clicked', e);
      dispatch(addLandmark(Na, e.e.offsetX, e.e.offsetY));
    },
  } as DispatchProps),

  // mergeProps
  (stateProps: StateProps, dispatchProps: DispatchProps) => assign(
    {},
    stateProps,
    dispatchProps,
    {
      onFileDropped: (file: File) => dispatchProps.dispatch(loadImageFile({
        file,
        height: stateProps.canvasHeight,
        width: stateProps.canvasWidth,
      })),
    },
  ) as AppProps,
)(App);
