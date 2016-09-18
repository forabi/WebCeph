import { fork } from 'redux-saga/effects';
import { Event } from '../../utils/constants';
import watchWorkspace from './workspace';

function* rootSaga() {
  yield fork(watchWorkspace);
}

export default rootSaga;