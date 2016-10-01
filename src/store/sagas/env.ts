import { takeLatest, eventChannel, END, Channel  } from 'redux-saga';
import { put, take, fork, call, Effect } from 'redux-saga/effects';
import keys from 'lodash/keys';
import noop from 'lodash/noop';
import each from 'lodash/each';

import { Event } from '../../utils/constants';
import featureDetails from '../../utils/features';

interface CheckResult {
  feature: string;
  isSupported: boolean;
}

function* performModernizrTests(): IterableIterator<CheckResult> {
  const Modernizr = require('exports?Modernizr!../../utils/modernizr.js');
  return eventChannel(emit => {
    let j = 0;
    const features = keys(featureDetails);
    const total = features.length;
    const completed = (feature: string) => (isSupported: boolean) => {
      emit({ feature, isSupported } as CheckResult);
      j++;
      if (j >= total) {
        emit(END);
      }
    };
    each(features, feature => Modernizr.on(feature, completed(feature)));
    return noop;
  });
}

function* checkBrowserCompatiblity(): IterableIterator<Effect> {
  console.info('[env] Performing browser compatiblity check...');
  const chan: Channel<any> = yield call(performModernizrTests);
  try {
    while (true) {
      const result: CheckResult = yield take(chan);
      // @TODO: figure out how to handle optional features
      if (!result.isSupported) {
        console.info('Found missing feature: ', result.feature);
        yield put({
          type: Event.BROWSER_COMPATIBLITY_CHECK_MISSING_FEATURE_DETECTED,
          payload: ({
            id: result.feature,
            optional: featureDetails[result.feature].optional,
            available: false,
          }) as MissingBrowserFeature,
        });
      } 
    }
  } catch (error) {
    console.error('Error checking browser compatiblity', error);
    yield put({ type: Event.BROWSER_COMPATIBLITY_CHECK_FAILED });
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