import React from 'react';
import map from 'lodash/map';
import Dialog from 'material-ui/Dialog';
import ListItem from 'material-ui/List/ListItem';
import List from 'material-ui/List/List';
import CircularProgress from 'material-ui/CircularProgress';
import identity from 'lodash/identity';
import { branch, pure, renderComponent } from 'recompose';
import { getDisplayNameForBrowser, getFeatureName, getWhyFeatureIsRequired } from './strings';
import Props from './props';

const classes = require('./style.scss');

const DetailsForNerds = ({ missingFeatures } : { missingFeatures: MissingBrowserFeature[] }) => (
  <div>
    If you are curious, the following features are missing:
    <List>
    {
      map(missingFeatures, feature => (
        <ListItem key={feature.id}
          primaryText={getFeatureName(feature)}
          secondaryText={getWhyFeatureIsRequired(feature)}
        />
      ))
    }
    </List>
  </div>
);

const CompatibilityChecker = pure((props: Props) => {
  const {
    open, className,
    shouldUpgradeCurrentBrowser, recommendedBrowsers,
    currentBrowser,
    isNerdMode = false, missingFeatures,
  } = props;
  return (
    <div className={className}>
      <Dialog open={open}>
        <h3>You are using an outdated web browser</h3>
        <div>
          Your web browser does not support all the features required for this application to work.
        </div>
        { shouldUpgradeCurrentBrowser  ? (
            <span>
              Consider upgrading to
              {' '}
              <a
              rel="noreferrer noopener"
              target="_blank"
              href={currentBrowser.downloadUrl}
              >
                a more recent version of your browser
              </a>
              , or using one of the following recommended browsers:
            </span>
          ) : 'Consider using one of the following recommended browsers: '
        }
        <div className={classes.browser_recommendation_container}>
          {
            map(recommendedBrowsers, ({ id, downloadUrl, icon }) => (
              <a key={id}
                rel="noreferrer noopener"
                target="_blank"
                href={downloadUrl}
                className={classes.browser_recommendation}
              >
                <div className={classes.browser_recommendation__browser_icon}>
                  <img src={icon} />
                </div>
                <span className={classes.browser_recommendation__browser_name}>
                  {getDisplayNameForBrowser(id)}
                </span>
              </a>
            ))
          }
        </div>
        { !isNerdMode ? null : <DetailsForNerds missingFeatures={missingFeatures} /> }
      </Dialog>
    </div>
  );
});

const ProgressDialog = pure((props: Props) => (
  <Dialog className={classes.dialog__loading} open={props.open}>
    <div className={classes.loading_container}>
      <CircularProgress />
      <span>Checking browser compatiblity...</span>
    </div>
  </Dialog>
));

export default branch(
  (props: Props) => props.isChecking,
  renderComponent(ProgressDialog),
  identity,
)(CompatibilityChecker);
