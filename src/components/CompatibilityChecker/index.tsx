import React from 'react';
import reject from 'lodash/reject';
import keys from 'lodash/keys';
import map from 'lodash/map';
import filter from 'lodash/filter';
import Dialog from 'material-ui/Dialog';
import ListItem from 'material-ui/List/ListItem';
import List from 'material-ui/List/List';

const Modernizr = require('exports?Modernizr!../../utils/modernizr.js');


import featureDetails from './features';
import browserDetails, { currentBrowser, BrowserId } from './browsers';

interface BrowserFeature {
  id: string;
  available: boolean;
  optional: boolean;
}

interface Browser {
  id: BrowserId;
  /** Display name for the browser */
  name: string;
  /**
   * Indicates if this browser may need to be updated to a more recent version
   */
  outdated: boolean;
  /**
   * The current version of the browser
   */
  version: string;
  /**
   * URL to the download page of the browser
   */
  downloadUrl: string;
}

interface BrowserRecommendation {
  id: BrowserId;
  /** Display name for the browser */
  name: string;
}

const missingFeatures: BrowserFeature[] = reject(map(
  keys(Modernizr), (key => ({
    id: key,
    available: Boolean(Modernizr[key]),
    optional: false,
  })),
), f => f.available || f.optional);


interface CompatibilityCheckerProps {
  open: boolean;
  className: string;
  missingFeatures: (BrowserFeature & { available: false })[];
  recommendedBrowsers: BrowserRecommendation[];
  currentBrowser: Browser;
  onDialogClosed: () => void;
}

const classes = require('./style.scss');

const CompatibilityChecker = (props: CompatibilityCheckerProps) => (
  <div className={props.className}>
    <Dialog open={props.open}>
      <h3>Browser incompatible</h3>
      <div>
        Your browser does not support all the features required for this application to work.
      </div>
      { props.currentBrowser.outdated ? (
          <span>
            Consider upgrading to
            {' '}
            <a
             rel="noreferrer noopener"
             target="_blank"
             href={props.currentBrowser.downloadUrl}
            >
              a more recent version
            </a>
            {' '}
            of your browser, or using one of the following recommended browsers:
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
      The following features are missing:
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

CompatibilityChecker.defaultProps = {
  missingFeatures,
  open: true,
  currentBrowser: {
    id: currentBrowser.name,
    downloadUrl: browserDetails[currentBrowser.name].downloadUrl,
    version: currentBrowser.version,
    outdated: missingFeatures.length > 0,
  },
  recommendedBrowsers: filter([
    {
      id: 'Chrome',
      name: 'Chrome',
    },
    {
      id: 'Firefox',
      name: 'Firefox',
    },
    {
      id: 'Microsoft Edge',
      name: 'Edge',
    },
    {
      id: 'Opera',
      name: 'Opera',
    },
    {
      id: 'Safari',
      name: 'Safari',
    },
  ] as { id: BrowserId; name: string }[], b => {
    if (browserDetails[b.id].isApplicable) {
      return browserDetails[b.id].isApplicable();
    }
    return true;
  }),
} as CompatibilityCheckerProps;

export default CompatibilityChecker;