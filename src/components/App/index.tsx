import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { connect } from 'react-redux';
import CephaloEditor from '../CephaloEditor';
import cx from 'classnames';
import assign from 'lodash/assign';
import {
  flipImageX,
  invertImage,
  setBrightness,
  loadImageFile,
  resetWorkspace,
  ignoreLikelyNotCephalo,
} from '../../actions/workspace';
import attempt from 'lodash/attempt';
import some from 'lodash/some';

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
}

interface DispatchProps {
  dispatch: Function;
  onFlipXClicked(e: __React.MouseEvent): void;
  onInvertClicked(e: __React.MouseEvent): void;
  onBrightnessChanged(value: number): void;
  onPickAnotherImageClicked(...args: any[]): void;
  onIgnoreNotCephaloClicked(...args: any[]): void;
  onEditLandmarkClicked(e?: __React.MouseEvent): void;
  onRemoveLandmarkClicked(e?: __React.MouseEvent): void;
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
    isAnalysisActive: state['cephalo.workspace.activeAnalysis'] !== null,
    isAnalysisComplete: false, // @TODO
  } as StateProps),

  // mapDispatchToProps
  (dispatch: Function) => ({
    dispatch,
    onFlipXClicked: () => dispatch(flipImageX()),
    onBrightnessChanged: (value: number) => dispatch(setBrightness(value)),
    onInvertClicked: () => dispatch(invertImage()),
    onPickAnotherImageClicked: () => dispatch(resetWorkspace()),
    onIgnoreNotCephaloClicked: () => dispatch(ignoreLikelyNotCephalo()),
    onEditLandmarkClicked: () => null, // @TODO
    onRemoveLandmarkClicked: () => null, // @TODO
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
