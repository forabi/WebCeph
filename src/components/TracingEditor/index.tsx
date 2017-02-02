import * as React from 'react';
import Props from './props';

import CephDropzone from 'components/CephDropzone/connected';

export default class TracingEditor extends React.PureComponent<Props, { }> {
  render() {
    const { imageId, className, onFilesDrop, onDemoButtonClick } = this.props;
    return (
      <div className={className}>
      {(imageId !== null) ? (
        <div>
          Image canvas goes here
        </div>
      ) : (
        <CephDropzone
          onFilesDrop={onFilesDrop}
          onDemoButtonClick={onDemoButtonClick}
        />
      )}
      </div>
    );
  }
}
