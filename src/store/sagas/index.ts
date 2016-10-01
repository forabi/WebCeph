import { fork } from 'redux-saga/effects';
import watchWorkspace from './workspace';
import envSaga from './env';

function* rootSaga() {
  yield fork(watchWorkspace);
  yield fork(envSaga);
}

export default rootSaga;