import * as React from 'react';
import Props from './props';

import CephDropzone from 'components/CephDropzone/connected';
// import TracingViewer from 'components/TracingViewer/connected';
import TracingToolbar from 'components/TracingToolbar/connected';

const style: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
};

const TracingViewer = ({ className }) => <h2 className={className} style={style} >Image tracing</h2>;

const classes = require('./style.scss');

export default class TracingEditor extends React.PureComponent<Props, { }> {
  render() {
    const { imageId, className, onFilesDrop, onDemoButtonClick } = this.props;
    return (
      <div className={className}>
        {(imageId !== null) ? (
          <TracingViewer
            className={classes.main}
            imageId={imageId}
          />
        ) : (
          <CephDropzone
            onFilesDrop={onFilesDrop}
            onDemoButtonClick={onDemoButtonClick}
            className={classes.main}
          />
        )}
        <TracingToolbar className={classes.toolbar} imageId={imageId} />
      </div>
    );
  }
}
