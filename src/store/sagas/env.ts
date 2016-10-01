import { Event } from '../../utils/constants';
import { takeLatest } from 'redux-saga';
import { put, fork, Effect } from 'redux-saga/effects';
import reject from 'lodash/reject';
import keys from 'lodash/keys';
import map from 'lodash/map';

function* checkBrowserCompatiblity(): IterableIterator<Effect> {
  console.info('[env] Performing browser compatiblity check...');
  const Modernizr = require('exports?Modernizr!../../utils/modernizr.js');
  const missingFeatures: BrowserFeature[] = reject(map(
    keys(Modernizr), (key => ({
      id: key,
      available: Boolean(Modernizr[key]),
      optional: false,
    })),
  ), f => f.available || f.optional);
  // const missingFeatures: BrowserFeature[] = [{
  //   id: 'contextmenu',
  //   available: false,
  //   optional: false,
  // }];
  console.info('[env] Finished checking browser compatiblity. Missing features:', missingFeatures);
  yield put({ type: Event.BROWSER_COMPATIBLITY_CHECK_FINISHED, payload: missingFeatures });
}

function* envSaga() {
  yield fork(takeLatest, Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED, checkBrowserCompatiblity);
}

export default envSaga;