import { Event } from 'utils/constants';
import { Store, Middleware } from 'redux';

import {
  compatiblityCheckSucceeded,
  compatiblityCheckFailed,
} from 'actions/initialization';

import keys from 'lodash/keys';
import each from 'lodash/each';

import { foundMissingFeature } from 'actions/initialization';

import featureDetails from 'utils/features';

const middleware: Middleware = (_: Store<any>) =>
  (next: DispatchFunction) => async (action: Action<any>) => {
    const { type } = action;
    if (type !== Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED) {
      return next(action);
    } else {
      try {
        const Modernizr = require('exports-loader?Modernizr!utils/modernizr.js');
        const features = keys(featureDetails);
        const total = features.length;
        let j = 1;
        const completed = (feature: string) => (isSupported: boolean) => {
          /* Modernizr does not provide an event for completion yet
          * We need to keep track of how many features have completed compared to 
          * the number of features we need.
          */
          j++;
          if (!isSupported && !featureDetails[feature].optional) {
            next(foundMissingFeature({
              userAgent: navigator.userAgent,
              feature: {
                id: feature,
                optional: featureDetails[feature].optional || false,
                available: false,
              },
            }));
          }
          if (j === total) {
            next(compatiblityCheckSucceeded());
          }
        };
        // Listen for feature test events
        each(features, feature => Modernizr.on(feature, completed(feature)));

      } catch (e) {
        console.error(
          `Failed to set scale automatically.`,
          e,
        );
        next(compatiblityCheckFailed(e));
      }
    }
  };

export default middleware;
