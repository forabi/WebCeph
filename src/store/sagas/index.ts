import { fork } from 'redux-saga/effects';
import envSaga from './env';

function* rootSaga() {
  yield fork(envSaga);
}

export default rootSaga;
