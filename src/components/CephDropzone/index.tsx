import * as React from 'react';
import * as Dropzone from 'react-dropzone';
import * as cx from 'classnames';
import { Button, ButtonType } from 'office-ui-fabric-react/lib/Button';
// import join from 'lodash/join';
import Props from './props';

import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

import { FormattedMessage, injectIntl, InjectedIntl, defineMessages } from 'react-intl';

type InjectedIntlProps = {
  intl: InjectedIntl;
};

const messageDescriptors = defineMessages({
  action_load_sample_image: {
    id: 'action_load_sample_image',
    defaultMessage: 'Load sample image',
  },
  callout_load_sample_image: {
    id: 'callout_load_sample_image',
    defaultMessage: 'Don\'t have one around? Try a sample image from Wikipedia!',
  },
  action_pick_image: {
    id: 'action_pick_image',
    defaultMessage: 'Click to pick an image',
  },
});

const classes = require('./style.scss');
const scaleInAndRotate = require('transitions/scale-in-and-rotate.scss');
const fadeIn = require('transitions/fade-in.scss');

const DropzonePlaceholder = require(
  'svg-react-loader?name=DropzonePlaceholder!svgo-loader?useConfig=svgoConfig!./assets/placeholder.svg',
) as React.DOMFactory<React.DOMAttributes<SVGElement>, SVGElement>;

class CephDropzone extends React.PureComponent<Props & InjectedIntlProps, { }> {
  dropzone: null | React.ReactInstance & { open: Function };

  render() {
    const {
      onFilesDrop,
      onDemoButtonClick,
      isOffline,
      className,
      // supportedImageTypes = [
      //   'image/jpeg',
      //   'image/png',
      //   'image/bmp',
      //   'application/wceph',
      //   'application/zip',
      // ],
      allowsMultipleFiles = false,
      intl: { formatMessage },
    } = this.props;
    return (
      <Dropzone
        ref={this.setRef}
        className={cx(className, classes.dropzone)}
        activeClassName={classes.dropzone__active}
        rejectClassName={classes.dropzone__reject}
        onDrop={onFilesDrop}
        multiple={allowsMultipleFiles}
        disableClick
        disablePreview
      >
        <ReactCSSTransitionGroup
          className={cx(
            fadeIn.root,
            classes.dropzone_load_demo,
            classes.text_center,
          )}
          transitionAppear
          transitionName={fadeIn}
          transitionAppearTimeout={1000}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          <div className={classes.dropzone_placeholder}>
            <ReactCSSTransitionGroup
              transitionAppear
              className={cx(scaleInAndRotate.root, classes.dropzone_placeholder_image)}
              transitionName={scaleInAndRotate}
              transitionAppearTimeout={1000}
              transitionEnterTimeout={1000}
              transitionLeaveTimeout={1000}
            >
              <DropzonePlaceholder
                className={classes.dropzone_svg}
              />
            </ReactCSSTransitionGroup>
            <span className={cx(classes.dropzone_placeholder_text, classes.text_center, classes.muted)}>
              <FormattedMessage
                id="callout_start_tracing"
                defaultMessage="To start tracing, drop a cephalogram or a photograph here"
              />
            </span>
            <Button
              buttonType={ButtonType.primary}
              onClick={this.openFilePicker}
            >
              {formatMessage(messageDescriptors.action_pick_image)}
            </Button>
          </div>
        </ReactCSSTransitionGroup>
        {
          isOffline ? (
            null
          ) : (
            <div className={cx(classes.dropzone_load_demo, classes.text_center)}>
              <small
                className={classes.muted}
              >
                {formatMessage(messageDescriptors.callout_load_sample_image)}
              </small>
              <br />
              <Button
                className={classes.demo_button}
                onClick={onDemoButtonClick}
              >
                {formatMessage(messageDescriptors.action_load_sample_image)}
              </Button>
            </div>
          )
        }
      </Dropzone>
    );
  };

  private setRef = (node: any) => this.dropzone = node;
  private openFilePicker = () => {
    if (this.dropzone !== null) {
      this.dropzone.open();
    }
  }
};

export default injectIntl(CephDropzone);
