import * as React from 'react';
import { findDOMNode } from 'react-dom';

import CircularProgress from 'material-ui/CircularProgress';

import ResizeObservable from 'utils/resize-observable';

import TracingView from 'components/TracingView/connected';
import CephaloDropzone from 'components/CephaloDropzone/connected';
import CephaloImage from 'components/CephaloImage/connected';
import Lens from 'components/Lens/connected';

import * as cx from 'classnames';

import Props from './props';

import { pure } from 'recompose';

import map from 'lodash/map';

const classes = require('./style.scss');

const Content = pure(({ hasImage, mode, stageIds, shouldShowLens, isLoading }: Props) => {
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
        {
          map(stageIds, (stageId) => <TracingView stageId={stageId} />)
        }
        {
          mode === 'superimposition' ? <SuperimpositionDropzone /> : null
        }
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

class Workspace extends React.PureComponent<Props, { }> {
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
    = ({ contentRect }) => this.props.onResize(contentRect);
};

export default Workspace;
