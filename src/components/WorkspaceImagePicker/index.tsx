import * as React from 'react';
import Props from './props';

import times from 'lodash/times';

const classes = require('./style.scss');

export default class WorkspaceImagePicker extends React.PureComponent<Props, { }> {
  render() {
    return (
      <div className={classes.root}>
        {times(3, (n) => {
          return <div className={classes.image}>{n}</div>;
        })}
        {
          <div className={classes.image_placeholder}>+</div>
        }
      </div>
    )
  }
}
