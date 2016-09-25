import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { handleActions } from 'redux-actions';
import { Event } from '../utils/constants';
import rootSaga from './sagas';
import assign from 'lodash/assign';
import omit from 'lodash/omit';
import downs from '../analyses/downs';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers({
  'cephalo.workspace.image.data': handleActions<string | null, any>({
    [Event.LOAD_IMAGE_REQUESTED]: () => null,
    [Event.LOAD_IMAGE_SUCCEEDED]: (_, { payload }) => payload,
    [Event.LOAD_IMAGE_FAILED]: () => null,
    [Event.RESET_WORKSPACE_REQUESTED]: () => null,
  }, null),
  'cephalo.workspace.error': handleActions<{ message: string } | null, any>({
    [Event.IGNORE_WORKSPACE_ERROR_REQUESTED]: () => null,
    [Event.LOAD_IMAGE_FAILED]: (__, { payload }) => payload,
    [Event.RESET_WORKSPACE_REQUESTED]: () => null,
    [Event.LOAD_IMAGE_REQUESTED]: () => null,
  }, null),
  'cephalo.workspace.canvas.height': handleActions<number, any>({
    [Event.CANVAS_RESIZED]: (_, { payload }) => payload.height,
  }, 600),
  'cephalo.workspace.canvas.width': handleActions<number, any>({
    [Event.CANVAS_RESIZED]: (_, { payload }) => payload.width,
  }, 600),
  'cephalo.workspace.image.isCephalo': handleActions<boolean, any>({
    [Event.SET_IS_CEPHALO_REQUESTED]: (_, { payload }) => payload.isCephalo,
    [Event.RESET_WORKSPACE_REQUESTED]: () => true,
  }, true),
  'cephalo.workspace.image.shouldFlipX': handleActions<boolean, any>({
    [Event.LOAD_IMAGE_REQUESTED]: () => false,
    [Event.SET_IS_CEPHALO_REQUESTED]: (state, { payload }) => payload.shouldFlipX || state,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.image.isLoading': handleActions<boolean, any>({
    [Event.LOAD_IMAGE_REQUESTED]: () => true,
    [Event.LOAD_IMAGE_FAILED]: () => false,
    [Event.LOAD_IMAGE_SUCCEEDED]: () => false,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.image.flipX': handleActions<boolean, any>({
    [Event.FLIP_IMAGE_X_REQUESTED]: (state: boolean) => !state,
    [Event.LOAD_IMAGE_REQUESTED]: () => false,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.image.brightness': handleActions<number, any>({
    [Event.SET_IMAGE_BRIGHTNESS_REQUESTED]: (__, { payload }) => payload,
    [Event.LOAD_IMAGE_REQUESTED]: () => 0,
    [Event.RESET_WORKSPACE_REQUESTED]: () => 0,
  }, 0),
  'cephalo.workspace.image.invert': handleActions<boolean, any>({
    [Event.INVERT_IMAGE_REQUESTED]: (state) => !state,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.analysis.activeAnalysis': handleActions<Analysis | null, any>({
    [Event.SET_ACTIVE_ANALYSIS_REQUESTED]: (__, { payload }) => payload,
    // [Event.LOAD_IMAGE_REQUESTED]: () => null,
    // [Event.RESET_WORKSPACE_REQUESTED]: () => null,
  }, downs),
  'cephalo.workspace.analysis.isLoading': handleActions<any, boolean>({
    [Event.FETCH_ANALYSIS_SUCCEEDED]: () => false,
    [Event.FETCH_ANALYSIS_FAILED]: () => false,
    [Event.FETCH_ANALYSIS_REQUESTED]: () => true,
  }, false),
  'cephalo.workspace.landmarks': handleActions<any, any>({
    [Event.ADD_LANDMARK_REQUESTED]: (state, { payload }) => assign(
      { },
      state,
      {
        [payload.landmark.symbol]: assign(
          { },
          payload.landmark,
          {
            visible: true,
            mappedTo: { x: payload.x, y: payload.y },
          }
        ),
      },
    ),
    [Event.REMOVE_LANDMARK_REQUESTED]: (state, { payload }) => omit(state, payload.symbol),
  }, { }),
  'cephalo.workspace.workers': handleActions<{
    [id: string]: {
      isBusy: boolean,
      error?: { message: string },
    },
  }, any>({
    [Event.WORKER_CREATED]: (state, { payload }) => {
      return assign(
        { },
        state,
        {
          [payload.workerId]: payload,
        },
      );
    },
    [Event.WORKER_TERMINATED]: (state, { payload }) => omit(state, payload.workerId),
    [Event.WORKER_STATUS_CHANGED]: (state, { payload }) => {
      return assign(
        { },
        state,
        {
          [payload.workerId]: assign(
            { },
            state[payload.workerId],
            payload,
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