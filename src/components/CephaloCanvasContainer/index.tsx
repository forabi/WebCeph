import * as React from 'react';
import { findDOMNode } from 'react-dom';

import CircularProgress from 'material-ui/CircularProgress';

import ResizeObservable from 'utils/resize-observable';

import CephaloCanvas from 'components/CephaloCanvas/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';

import * as cx from 'classnames';

import Props from './props';

import { pure } from 'recompose';

const classes = require('./style.scss');

const Content = pure(({ hasImage, isLoading }: Props) => {
  if (hasImage) {
    return <CephaloCanvas />;
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
    const { scrollWidth, scrollHeight, clientWidth, clientHeight }  = node;
    node.scrollTo((scrollWidth - clientWidth) / 2, (scrollHeight - clientHeight) / 2);
  }

  public render() {
    const { hasImage, className } = this.props;
    return (
      <ResizeObservable
        ref={hasImage ? this.setRef : undefined}
        className={cx(className, classes.root)}
        onResize={this.handleResize}
      >
        <Content {...this.props} />
      </ResizeObservable>
    );
  }

  private setRef = (instance: React.ReactInstance | null) => this.childInstance = instance;

  private handleResize: (e: ResizeObserverEntry) => any
    = ({ contentRect: { width, height } }) => this.props.onResize(width, height);
};

export default CephaloCanvasContainer;
