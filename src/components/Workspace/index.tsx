import * as React from 'react';

import TracingEditor from 'components/TracingEditor/connected';
import SuperimpositionEditor from 'components/SuperimpositionEditor/connected';

import ResizeObservable from 'utils/resize-observable';

import Props from './props';

import * as cx from 'classnames';

const classes = require('./style.scss');

export class Workspace extends React.PureComponent<Props, { }> {
  handleResize = ({ contentRect }: ResizeObserverEntry) => {
    this.props.onResize(contentRect);
  }

  render() {
    const { mode, workspaceId, className } = this.props;
    const props = {
      workspaceId,
      className: classes.content,
    };
    return (
      <ResizeObservable
        className={cx(classes.root, className)}
        onResize={this.handleResize}
      >
        {mode === 'tracing' ? (
          <TracingEditor
            className={classes.content}
            {...props}
          />
        ) : (
          <SuperimpositionEditor
            {...props}
          />
        )}
      </ResizeObservable>
    );
  }
}

export default Workspace;
