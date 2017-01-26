import * as React from 'react';
import Dropzone from 'react-dropzone/src/index.js';
import Props from './props';

import map from 'lodash/map';

const classes = require('./style.scss');

export default class WorkspaceImagePicker extends React.PureComponent<Props, { }> {
  handleDrop = () => {
    alert('Dropped');
  }

  render() {
    const { showDropzone = true } = this.props;
    return (
      <div className={classes.root}>
        {map(this.props.images, (_, i) => (
          <button className={classes.image}>
            <span className={classes.image_dropzone_icon}>
              {i + 1}
            </span>
          </button>
        ))}
        {!showDropzone ? null : (
          <Dropzone
            className={classes.image_dropzone}
            activeClassName={classes.image_dropzone__active}
            rejectClassName={classes.image_dropzone__reject}
            onDropAccepted={this.handleDrop}
            tabIndex={0}
          >
            <span className={classes.image_dropzone_icon}>
              +
            </span>
          </Dropzone>
        )}
      </div>
    );
  }
}
