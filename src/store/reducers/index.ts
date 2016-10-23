import { handleActions } from 'redux-actions';
import assign from 'lodash/assign';
import reduce from 'lodash/reduce';
import omit from 'lodash/omit';
import { Event, StoreKeys } from '../../utils/constants';
import defaultAnalysis from '../../analyses/basic';
import env from './env';
import workspace from './workspace';
import image from './image';


const newReducer = reduce([
  env,
  workspace,
  image,
], assign, { });

const oldReducers = {
  'cephalo.workspace.image.isCephalo': handleActions<boolean, any>({
    [Event.SET_IS_CEPHALO_REQUESTED]: (_, { payload }) => payload.isCephalo,
    [Event.RESET_WORKSPACE_REQUESTED]: () => true,
  }, true),
  'cephalo.workspace.image.shouldFlipX': handleActions<boolean, any>({
    [Event.LOAD_IMAGE_REQUESTED]: () => false,
    [Event.SET_IS_CEPHALO_REQUESTED]: (state, { payload }) => payload.shouldFlipX || state,
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