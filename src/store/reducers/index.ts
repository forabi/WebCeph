import { handleActions } from 'redux-actions';
import assign from 'lodash/assign';
import reduce from 'lodash/reduce';
import omit from 'lodash/omit';
import { Event, StoreKeys } from '../../utils/constants';
import defaultAnalysis from '../../analyses/basic';
import manualLandmarks from './manualLandmarks';
import env from './env';
import workspace from './workspace';

const newReducer = reduce([
  manualLandmarks,
  env,
  workspace,
], assign, { });

const oldReducers = {
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
    [Event.SET_IMAGE_CONTRAST_REQUESTED]: (__, { payload }) => payload,
    [Event.LOAD_IMAGE_REQUESTED]: () => 1,
    [Event.RESET_WORKSPACE_REQUESTED]: () => 1,
  }, 1),
  'cephalo.workspace.image.invert': handleActions<boolean, any>({
    [Event.INVERT_IMAGE_REQUESTED]: (state) => !state,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  }, false),
  'cephalo.workspace.analysis.activeAnalysis': handleActions<Analysis | null, any>({
    [Event.SET_ACTIVE_ANALYSIS_REQUESTED]: (__, { payload }) => payload,
  }, defaultAnalysis),
  'cephalo.workspace.analysis.stepsBeingEvaluated': handleActions<{ [symbol: string]: true }, string>({
    [Event.STEP_EVALUATION_STARTED]: (state, { payload }) => assign({ }, state, { [payload]: true }),
    [Event.STEP_EVALUATION_FINISHED]: (state, { payload }) => omit(state, payload),
  }, { }),
  'cephalo.workspace.analysis.isLoading': handleActions<boolean, boolean>({
    [Event.FETCH_ANALYSIS_SUCCEEDED]: () => false,
    [Event.FETCH_ANALYSIS_FAILED]: () => false,
    [Event.FETCH_ANALYSIS_REQUESTED]: () => true,
  }, false),
  'cephalo.workspace.analysis.results.areShown': handleActions<boolean, boolean>({
    [Event.SHOW_ANALYSIS_RESULTS_REQUESTED]: () => true,
    [Event.RESET_WORKSPACE_REQUESTED]: () => true,
    [Event.CLOSE_ANALYSIS_RESULTS_REQUESTED]: () => false,
  }, false),
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
};

const reducers = assign({ }, newReducer, oldReducers);

export default reducers;