import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { connect } from 'react-redux';
import CephaloEditor from '../CephaloEditor';
import cx from 'classnames';
import { flipImageX, invertImage, setBrightness, loadImageFile } from '../../actions/workspace';
import attempt from 'lodash/attempt';
import some from 'lodash/some';

const classes = require('./style.scss');

require('../../layout/_index.scss');

attempt(injectTapEventPlugin);

interface AppStaticProps {
  src: string | null;
  flipX: boolean;
  flipY: boolean;
  brightness: number;
  inverted: boolean;
  isLoading: boolean;
  isWorkerBusy: boolean;
  dispatch: Function;
}

interface AppFunctions {
  onFlipXClicked(e: __React.MouseEvent): void;
  onInvertClicked(e: __React.MouseEvent): void;
  onFileDropped(file: File): void;
  onBrightnessChanged(value: number): void;
}

type AppProps = AppStaticProps & AppFunctions;

const App = (props: AppProps) => (
  <MuiThemeProvider>
    <div className={cx('col-xs-12', classes.root)}>
      <CephaloEditor
        className={cx('row', classes.editor)}
        src={props.src}
        onFileDropped={props.onFileDropped}
        onFlipXClicked={props.onFlipXClicked}
        onBrightnessChanged={props.onBrightnessChanged}
        onInvertClicked={props.onInvertClicked}
        brightness={props.brightness}
        inverted={props.inverted}
        flipX={props.flipX}
        flipY={props.flipY}
        isLoading={props.isLoading}
        isWorkerBusy={props.isWorkerBusy}
      />
    </div>
  </MuiThemeProvider>
);

export default connect(
  (state: StoreState) => ({
    flipX: state['cephalo.workspace.image.flipX'],
    flipY: state['cephalo.workspace.image.flipY'],
    brightness: state['cephalo.workspace.image.brightness'],
    inverted: state['cephalo.workspace.image.invert'],
    isLoading: state['cephalo.workspace.image.isLoading'],
    isWorkerBusy: some(state['cephalo.workspace.workers'], 'isBusy'),
    src: state['cephalo.workspace.image.data'],
  } as AppStaticProps),
  (dispatch: Function) => ({
    onFileDropped: (file: File) => dispatch(loadImageFile({ file, height: 100, width: 100 })),
    onFlipXClicked: () => dispatch(flipImageX()),
    onBrightnessChanged: (value: number) => dispatch(setBrightness(value)),
    onInvertClicked: () => dispatch(invertImage()),
  } as AppFunctions),
)(App);
