import * as React from 'react';
import ResizeObservable from 'utils/resize-observable';
import CephaloCanvas from 'components/CephaloCanvas/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';
import * as cx from 'classnames';
import Props from './props';
import { findDOMNode } from 'react-dom';

const classes = require('./style.scss');

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
        {hasImage ? <CephaloCanvas /> : <CephaloDropzone />}
      </ResizeObservable>
    );
  }

  private setRef = (instance: React.ReactInstance | null) => this.childInstance = instance;

  private handleResize: (e: ResizeObserverEntry) => any
    = ({ contentRect: { width, height } }) => this.props.onResize(width, height);
};

export default CephaloCanvasContainer;
