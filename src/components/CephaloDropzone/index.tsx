import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import * as cx from 'classnames';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import join from 'lodash/join';
import Props from './props';

const classes = require('./style.scss');
const DropzonePlaceholder = require(
  'svg-react?name=DropzonePlaceholder!svgo?useConfig=svgoConfig!./assets/placeholder.svg'
) as React.SFCFactory<React.SVGAttributes<SVGElement>>;

class CephaloDropzone extends React.PureComponent<Props, { }> {
  refs: {
    dropzone: React.ReactInstance & { open: () => void; }
  };

  private openFilePicker = () => this.refs.dropzone.open();

  render() {
    const {
      onFilesDropped,
      onDemoButtonClick,
      supportedImageTypes = ['image/jpeg', 'image/png', 'image/bmp'],
      allowsMultipleFiles = false,
    } = this.props;
    return (
      <Dropzone ref="dropzone"
        className={classes.dropzone}
        activeClassName={classes.dropzone__active}
        rejectClassName={classes.dropzone__reject}
        onDrop={onFilesDropped}
        multiple={allowsMultipleFiles}
        accept={join(supportedImageTypes, ',')}
        disableClick
        disablePreview
      >
        <div className={classes.dropzone_placeholder}>
          <DropzonePlaceholder className={classes.dropzone_placeholder_image} />
          <span className={cx(classes.dropzone_placeholder_text, classes.text_center, classes.muted)}>
            To start tracing, drop a cephalometric radiograph here or
          </span>
          <RaisedButton
            primary
            label="Click to pick an image"
            onClick={this.openFilePicker}
          />
          <br />
          <small
            className={cx(classes.text_center, classes.muted)}
            style={{ margin: 0 }}
          >
            Don't have one around? Try a sample image from Wikipedia!
          </small>
            <br />
          <FlatButton
            style={{ margin: 0 }}
            secondary
            primary
            label="Load sample image"
            onClick={onDemoButtonClick}
          />
        </div>
      </Dropzone>
    );
  };
};

export default CephaloDropzone;
