import { takeLatest, eventChannel, END, Channel } from 'redux-saga';
import { put, take, fork, call, Effect } from 'redux-saga/effects';
import keys from 'lodash/keys';
import noop from 'lodash/noop';
import each from 'lodash/each';

import { foundMissingFeature } from 'actions/initialization';
import { Event } from 'utils/constants';
import featureDetails from 'utils/features';

interface CheckResult {
  feature: string;
  isSupported: boolean;
}

function performModernizrTests() {
  // Lazily load Modernizr to start performing feature tests
  const Modernizr = require('exports-loader?Modernizr!utils/modernizr.js');

  return eventChannel(emit => {
    /** This is used to keep track of number of features completed. See below. */
    let j = 1;

    const features = keys(featureDetails);
    const total = features.length;
    /**
     * This function is fired whenever an individual feature detection test is finished
     */
    const completed = (feature: string) => (isSupported: boolean) => {
      if (!featureDetails[feature].optional) {
        emit({ feature, isSupported } as CheckResult);
      }

      /* Modernizr does not provide an event for completion yet
       * We need to keep track of how many features have completed compared to 
       * the number of features we need.
       */
      j++;
      if (j >= total) {
        emit(END);
      }
    };

    // Listen for feature test events
    each(features, feature => Modernizr.on(feature, completed(feature)));

    // Unsubscribe function for this channel. We do not need to do any clean up.
    return noop;
  });
}

function* checkBrowserCompatiblity(): IterableIterator<Effect> {
  console.info('[env] Performing browser compatiblity check...');
  const chan: Channel<CheckResult> = yield call(performModernizrTests);
  try {
    while (true) {
      const result: CheckResult = yield take(chan);
      // @TODO: Figure out how to handle optional features
      if (!result.isSupported) {
        console.info('Detected missing feature: ', result.feature);
        yield put(foundMissingFeature({
          userAgent: navigator.userAgent,
          feature: {
            id: result.feature,
            optional: featureDetails[result.feature].optional || false,
            available: false,
          },
        }));
      }
    }
  } catch (error) {
    console.error('Error checking browser compatiblity', error);
    yield put({ type: Event.BROWSER_COMPATIBLITY_CHECK_FAILED, payload: error });
  } finally {
    chan.close();
    console.info('[env] Finished checking browser compatiblity.');
    yield put({ type: Event.BROWSER_COMPATIBLITY_CHECK_SUCCEEDED });
  }
}

function* envSaga() {
  yield fork(takeLatest, Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED, checkBrowserCompatiblity);
}

export default envSaga;
