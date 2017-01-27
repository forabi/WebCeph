import * as React from 'react';
import Dropzone from 'react-dropzone/src/index.js';
import CephaloImage from 'components/CephaloImage/async';
import AsyncComponent from 'components/AsyncComponent';
import Props from './props';

import CircularProgress from 'material-ui/CircularProgress';

import map from 'lodash/map';

const classes = require('./style.scss');

const Loading = () => (
  <button className={classes.image_container__loading}>
    <CircularProgress color="white" />
  </button>
);

const Error = () => (
  <button disabled className={classes.image_container__error}>
    Error loading file
  </button>
);

export default class WorkspaceImagePicker extends React.PureComponent<Props, { }> {
  handleDrop = ([file]: File[]) => {
    this.props.onRequestFileLoad(file);
  }

  render() {
    const {
      showDropzone = true,
      hasFileLoadFailed,
      isFileLoading,
    } = this.props;
    return (
      <div className={classes.root}>
        {map(this.props.images, (imageId) => (
          <button className={classes.image_container}>
            <CephaloImage
              className={classes.image}
              key={imageId}
              imageId={imageId}
            />
          </button>
        ))}
        <AsyncComponent
          hasFailed={hasFileLoadFailed}
          isLoading={isFileLoading}
          WhileLoading={Loading}
          Error={Error}
        />
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
