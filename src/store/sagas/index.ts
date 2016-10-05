import { fork } from 'redux-saga/effects';
import watchImageRequests from './image';
import watchSteps from './evaluation';
import envSaga from './env';

function* rootSaga() {
  yield fork(watchImageRequests);
  yield fork(watchSteps);
  yield fork(envSaga);
}

export default rootSaga;