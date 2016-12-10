import { Store, Middleware } from 'redux';

import {
  compatiblityCheckSucceeded,
  compatiblityCheckFailed,
} from 'actions/initialization';

import keys from 'lodash/keys';
import each from 'lodash/each';

import { foundMissingFeature } from 'actions/initialization';

import featureDetails from 'utils/features';

import { isActionOfType } from 'utils/store';

const middleware: Middleware = (_: Store<StoreState>) =>
  (next: GenericDispatch) => async (action: GenericAction) => {
    if (!isActionOfType(action, 'BROWSER_COMPATIBLITY_CHECK_REQUESTED')) {
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
            next(compatiblityCheckSucceeded(void 0));
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
