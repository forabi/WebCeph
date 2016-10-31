import { fork } from 'redux-saga/effects';
import watchImageRequests from './image';
import envSaga from './env';

function* rootSaga() {
  yield fork(watchImageRequests);
  yield fork(envSaga);
}

export default rootSaga;
