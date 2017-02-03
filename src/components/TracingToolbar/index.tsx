import * as React from 'react';
import Props from './props';

import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';

export default class TracingToolbar extends React.PureComponent<Props, { }> {
  render() {
    const { imageId, className } = this.props;
    return (
      <CommandBar
        className={className}
        items={[
          {
            icon: 'Add',
            key: 'newItem',
            name: 'Add',
            disabled: imageId === null,
          }
        ]}
      />
    );
  }
}
