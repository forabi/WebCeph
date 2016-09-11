import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { handleActions } from 'redux-actions';
import { Action } from '../utils/constants';
import rootSaga from './sagas';
import assign from 'lodash/assign';
import omit from 'lodash/omit';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers<StoreState>({
  'cephalo.workspace.image.data': handleActions<string | null, any>({
    [Action.LOAD_IMAGE_REQUESTED]: (_, __) => null,
    [Action.LOAD_IMAGE_SUCCEEDED]: (_, { payload }) => payload,
    [Action.LOAD_IMAGE_FAILED]: (_, __) => null,
  }, null),
  'cephalo.workspace.image.isLoading': handleActions<boolean, any>({
    [Action.LOAD_IMAGE_REQUESTED]: () => true,
    [Action.LOAD_IMAGE_FAILED]: () => false,
    [Action.LOAD_IMAGE_SUCCEEDED]: () => false,
  }, false),
  'cephalo.workspace.image.flipX': handleActions<boolean, any>({
    [Action.FLIP_IMAGE_X]: (state: boolean) => !state,
    [Action.LOAD_IMAGE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.image.brightness': handleActions<number, any>({
    [Action.SET_IMAGE_BRIGHTNESS]: (__, { payload }) => payload,
    [Action.LOAD_IMAGE_REQUESTED]: () => 0,
  }, 0),
  'cephalo.workspace.image.invert': handleActions<boolean, any>({
    [Action.INVERT_IMAGE]: (state) => !state,
  }, false),
  'cephalo.workspace.activeAnalysis': handleActions<Analysis | null, any>({
    [Action.SET_ACTIVE_ANALYSIS]: (__, { payload }) => payload,
    [Action.LOAD_IMAGE_REQUESTED]: () => null,
  }, null),
  'cephalo.workspace.landmarks': handleActions<{ [id: string]: CephaloLandmark }, any>({

  }, { }),
  'cephalo.workspace.workers': handleActions<{
    [id: string]: {
      isBusy: boolean,
      error?: { message: string },
    },
  }, any>({
    [Action.WORKER_CREATED]: (state, { payload }) => {
      return assign(
        { },
        state,
        {
          [payload.workerId]: payload,
        },
      );
    },
    [Action.WORKER_TERMINATED]: (state, { payload }) => omit(state, payload.workerId),
    [Action.SET_WORKER_STATUS]: (state, { payload }) => {
      return assign(
        { },
        state,
        {
          [payload.workerId]: assign(
            { },
            state[payload.workerId],
            payload
          ),
        },
      );
    },
  }, { }),
});

const sagaMiddleware = createSagaMiddleware();

const middlewares = [
  sagaMiddleware,
];

function addDevTools() {
  if (process.env.NODE_ENV !== 'production' && !!window.devToolsExtension) {
    return window.devToolsExtension();
  }
  return (f: any) => f;
}

const createConfiguredStore = () => {

  const store = createStore(
    reducer,
    compose(
      applyMiddleware(...middlewares),
      addDevTools(),
    ),
  );
  sagaMiddleware.run(rootSaga);
  return store;
};

export default createConfiguredStore;