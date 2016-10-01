import React from 'react';
import find from 'lodash/find';
import Dialog from 'material-ui/Dialog';
import ListItem from 'material-ui/List/ListItem';
import List from 'material-ui/List/List';

import featureDetails from '../../utils/features';
import browserDetails from '../../utils/browsers';

interface CompatibilityCheckerProps {
  open: boolean;
  isChecking: boolean;
  className?: string;
  missingFeatures: MissingBrowserFeature[];
  recommendedBrowsers: BrowserRecommendation[];
  currentBrowser: Browser;
  onDialogClosed: () => void;
}

const classes = require('./style.scss');

const CompatibilityChecker = (props: CompatibilityCheckerProps) => (
  <div className={props.className}>
    <Dialog open={props.open}>
      <h3>You are using an outdated web browser</h3>
      <div>
        Your browser does not support all the features required for this application to work.
      </div>
      { find(props.recommendedBrowsers, (b => b.id === props.currentBrowser.id))  ? (
          <span>
            Consider upgrading to
            {' '}
            <a
             rel="noreferrer noopener"
             target="_blank"
             href={props.currentBrowser.downloadUrl}
            >
              a more recent version of your browser
            </a>
            , or using one of the following recommended browsers:
          </span>
        ) : 'Consider using one of the following recommended browsers: '
      }
      <div className={classes.browser_recommendation_container}>
      {
        props.recommendedBrowsers.map(browser => (
          <a key={browser.id}
            rel="noreferrer noopener"
            target="_blank"
            href={browserDetails[browser.id].downloadUrl}
            className={classes.browser_recommendation}
          >
            <div className={classes.browser_recommendation__browser_icon}>
              {browserDetails[browser.id].icon}
            </div>
            <span className={classes.browser_recommendation__browser_name}>
              {browserDetails[browser.id].name}
            </span>
          </a>
        ))
      }
      </div>
      If you are curious, the following features are missing:
      <List>
      {
        props.missingFeatures.map(feature => (
          <ListItem key={feature.id}
            primaryText={featureDetails[feature.id].name}
            secondaryText={featureDetails[feature.id].whyRequired}
          />
        ))
      }
      </List>
    </Dialog>
  </div>
);

import branch from 'recompose/branch';
import pure from 'recompose/pure';
import renderComponent from 'recompose/renderComponent';
import CircularProgress from 'material-ui/CircularProgress';
import identity from 'lodash/identity';

const ProgressDialog = (props: CompatibilityCheckerProps) => (
  <Dialog className={classes.dialog__loading} open={props.open}>
    <div className={classes.loading_container}>
      <CircularProgress />
      <span>Checking browser compatiblity...</span>
    </div>
  </Dialog>
);

export default branch(
  (props: CompatibilityCheckerProps) => props.isChecking,
  renderComponent(ProgressDialog),
  identity,
)(pure(CompatibilityChecker));