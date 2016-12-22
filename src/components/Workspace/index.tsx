import * as React from 'react';
import { findDOMNode } from 'react-dom';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

import ResizeObservable from 'utils/resize-observable';

import TracingViewer from 'components/TracingViewer/connected';
import AnalysisSelector from 'components/AnalysisSelector/connected';
import AnalysisStepper from 'components/AnalysisStepper/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';
import CephaloImage from 'components/CephaloImage/connected';
import Lens from 'components/CephaloLens/connected';

import * as cx from 'classnames';

import Props from './props';

import { pure } from 'recompose';

const classes = require('./style.scss');

const Content = pure(({ hasImages, mode, shouldShowLens, isLoading }: Props) => {
  if (hasImages) {
    if (isLoading) {
      return (
        <div className={classes.loading_container}>
          <CircularProgress color="white" size={120} />
        </div>
      );
    } else if (mode === 'tracing') {
      return (
        <div>
          {
            shouldShowLens ? (
              <Lens className={classes.lens} margin={15}>
                <CephaloImage />
              </Lens>
            ) : null
          }
          <TracingViewer imageId={imageIds[0]} />
          <div className={classes.sidebar}>
            <AnalysisSelector className={classes.selector} />
            <AnalysisStepper className={classes.stepper} />
          </div>
        </div>
      );
    } else if (hasImages && mode === 'superimposition') {
      return (
        <span>Superimposition mode is still in the works :)</span>
      );
    }
  }
  return <CephaloDropzone />;
});

class CephaloCanvasContainer extends React.PureComponent<Props, { }> {
  private childInstance: React.ReactInstance | null;

  public componentDidUpdate() {
    // if (this.childInstance === null) {
    //   return;
    // }
    // const node = findDOMNode(this.childInstance);
    // if (node !== null) {
    //   const { scrollWidth, scrollHeight, clientWidth, clientHeight }  = node;
    //   node.scrollLeft = (scrollWidth - clientWidth) / 2;
    //   node.scrollTop = (scrollHeight - clientHeight) / 2;
    // }
  }

  public render() {
    const {
      className,
      hasImages,
      hasError, errorMessage, onRequestDismissError,
    } = this.props;
    const errorActions = [
      <FlatButton
        primary
        keyboardFocused={true}
        onTouchTap={onRequestDismissError}
        label="Dismiss"
      />,
    ];
    return (
      <ResizeObservable
        ref={hasImages ? this.setRef : undefined}
        className={cx(className, classes.root)}
        onResize={this.handleResize}
      >
        {
          !hasError ? null : (
            <Dialog
              open={hasError}
              onRequestClose={onRequestDismissError}
              actions={errorActions}
            >
              <span style={{ whiteSpace: 'pre-wrap' }}>{errorMessage}</span>
            </Dialog>
          )
        }
        <Content {...this.props} />
      </ResizeObservable>
    );
  }

  private setRef = (instance: React.ReactInstance | null) => this.childInstance = instance;

  private handleResize: (e: ResizeObserverEntry) => any
    = ({ contentRect }) => this.props.onResize(contentRect);
};

export default CephaloCanvasContainer;
