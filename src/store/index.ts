import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { handleActions } from 'redux-actions';
import { Event } from '../utils/constants';
import rootSaga from './sagas';
import assign from 'lodash/assign';
import omit from 'lodash/omit';
import without from 'lodash/without';
import common from '../analyses/common';
import isPlainObject from 'lodash/isPlainObject';

declare const window: Window & { devToolsExtension?: () => any };

const reducer = combineReducers({
  'env.compatiblity.isIgnored': handleActions({
    [Event.IGNORE_BROWSER_COMPATIBLITY_REQUESTED]: (_, __) => true,
    [Event.ENFORCE_BROWSER_COMPATIBLITY_REQUESTED]: (_, __) => false,
    [Event.BROWSER_COMPATIBLITY_CHECK_FAILED]: (_, __) => true,
  }, false),
  'env.compatiblity.isBeingChecked': handleActions({
    [Event.BROWSER_COMPATIBLITY_CHECK_REQUESTED]: (_, __) => true,
    [Event.BROWSER_COMPATIBLITY_CHECK_SUCCEEDED]: (_, __) => false,
    [Event.BROWSER_COMPATIBLITY_CHECK_FAILED]: (_, __) => false,
  }, false),
  'env.compatiblity.missingFeatures': handleActions<MissingBrowserFeature[], MissingBrowserFeature>({
    [Event.BROWSER_COMPATIBLITY_CHECK_MISSING_FEATURE_DETECTED]: (state, { payload }) => [
      ...state,
      payload,
    ],
  }, []),
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
  }, 792),
  'cephalo.workspace.canvas.width': handleActions<number, any>({
    [Event.CANVAS_RESIZED]: (_, { payload }) => payload.width,
  }, 960),
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
    [Event.LOAD_IMAGE_REQUESTED]: () => 50,
    [Event.RESET_WORKSPACE_REQUESTED]: () => 50,
  }, 50),
  'cephalo.workspace.image.contrast': handleActions<number, any>({
    [Event.SET_IMAGE_BRIGHTNESS_REQUESTED]: (__, { payload }) => payload,
    [Event.LOAD_IMAGE_REQUESTED]: () => 50,
    [Event.RESET_WORKSPACE_REQUESTED]: () => 50,
  }, 50),
  'cephalo.workspace.image.invert': handleActions<boolean, any>({
    [Event.INVERT_IMAGE_REQUESTED]: (state) => !state,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.analysis.activeAnalysis': handleActions<Analysis | null, any>({
    [Event.SET_ACTIVE_ANALYSIS_REQUESTED]: (__, { payload }) => payload,
  }, common),
  'cephalo.workspace.analysis.stepsBeingEvaluated': handleActions<string[], any>({
    [Event.STEP_EVALUATION_STARTED]: (state, { payload }) => [...state, payload],
    [Event.STEP_EVALUATION_FINISHED]: (state, { payload }) => without(state, payload),
  }, []),
  'cephalo.workspace.analysis.isLoading': handleActions<any, boolean>({
    [Event.FETCH_ANALYSIS_SUCCEEDED]: () => false,
    [Event.FETCH_ANALYSIS_FAILED]: () => false,
    [Event.FETCH_ANALYSIS_REQUESTED]: () => true,
  }, false),
  'cephalo.workspace.landmarks': handleActions<any, { symbol: string, value: GeometricalObject | number }>({
    [Event.ADD_LANDMARK_REQUESTED]: (state, { payload }) => assign(
      { },
      state,
      {
        [payload.symbol]: (
          isPlainObject(payload.value) ? assign(
            { },
            payload.value,
          ) : payload.value
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