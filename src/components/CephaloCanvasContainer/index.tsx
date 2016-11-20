import * as React from 'react';
import { findDOMNode } from 'react-dom';

import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';

import ResizeObservable from 'utils/resize-observable';

import CephaloCanvas from 'components/CephaloCanvas/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';
import CephaloImage from 'components/CephaloImage/connected';
import Lens from 'components/CephaloLens/connected';

import * as cx from 'classnames';

import Props from './props';

import { pure } from 'recompose';

const classes = require('./style.scss');

const Content = pure(({ hasImage, shouldShowLens, isLoading }: Props) => {
  if (hasImage) {
    return (
      <div>
        {
          shouldShowLens ? (
            <Lens className={classes.lens} margin={15}>
              <CephaloImage />
            </Lens>
          ) : null
        }
        <CephaloCanvas />
      </div>
    );
  } else if (isLoading) {
    return (
      <div className={classes.loading_container}>
        <CircularProgress color="white" size={120} />
      </div>
    );
  }
  return <CephaloDropzone />;
});

class CephaloCanvasContainer extends React.PureComponent<Props, { }> {
  private childInstance: React.ReactInstance | null;

  public componentDidUpdate() {
    if (this.childInstance === null) {
      return;
    }
    const node = findDOMNode(this.childInstance);
    if (node !== null) {
      const { scrollWidth, scrollHeight, clientWidth, clientHeight }  = node;
      node.scrollLeft = (scrollWidth - clientWidth) / 2;
      node.scrollTop = (scrollHeight - clientHeight) / 2;
    }
  }

  public render() {
    const {
      className,
      hasImage,
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
        ref={hasImage ? this.setRef : undefined}
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
