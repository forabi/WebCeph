import { handleActions } from 'redux-actions';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import assign from 'lodash/assign';
import tracing, { isLandmarkRemovable, getManualLandmarks } from './tracing';
import { createSelector } from 'reselect';
import { StoreKeys, Event } from 'utils/constants';
import { getStepsForAnalysis, isStepManual } from 'analyses/helpers';
import filter from 'lodash/filter';
import find from 'lodash/find';

type AnalysisId = StoreEntries.workspace.analysis.activeId;
type LoadError = StoreEntries.workspace.analysis.loadError;
type AreResultsShown = StoreEntries.workspace.analysis.results.areShown;
type IsAnalysisLoading = StoreEntries.workspace.analysis.isLoading;

const defaultAnalysisId: AnalysisId = null;

const activeAnalysisId = handleActions<AnalysisId, any>(
  {
    [Event.FETCH_ANALYSIS_SUCCEEDED]: (state, action) => {
      const { payload: analysisId } = action;
      if (analysisId === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return analysisId as Payloads.analysisLoadSucceeded;
    },
  },
  defaultAnalysisId,
)

const isAnalysisLoading = handleActions<IsAnalysisLoading, any>(
  {
    [Event.FETCH_ANALYSIS_SUCCEEDED]: () => false,
    [Event.FETCH_ANALYSIS_FAILED]: () => false,
    [Event.FETCH_ANALYSIS_REQUESTED]: () => true,
  },
  false,
);

const loadError = handleActions<LoadError, any>(
  {
    [Event.FETCH_ANALYSIS_SUCCEEDED]: () => null,
    [Event.FETCH_ANALYSIS_FAILED]: (state, { type, payload: error }) => {
      if (error === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return error as Payloads.analysisLoadFailed;
    },
    [Event.FETCH_ANALYSIS_REQUESTED]: () => null,
  },
  null,
)

const areResultsShown = handleActions<AreResultsShown, any>(
  {
    [Event.SHOW_ANALYSIS_RESULTS_REQUESTED]: () => true,
    [Event.RESET_WORKSPACE_REQUESTED]: () => true,
    [Event.CLOSE_ANALYSIS_RESULTS_REQUESTED]: () => false,
  },
  false,
);

const KEY_ACTIVE_ANALYSIS_ID = StoreKeys.activeAnalysisId;
const KEY_ARE_RESULTS_SHOWN = StoreKeys.areResultsShown;
const KEY_IS_ANALYSIS_LOADING = StoreKeys.isAnalysisLoading;
const KEY_ANALYSIS_LOAD_ERROR = StoreKeys.analysisLoadError;

export default assign({
  [KEY_ACTIVE_ANALYSIS_ID]: activeAnalysisId,
  [KEY_IS_ANALYSIS_LOADING]: isAnalysisLoading,
  [KEY_ANALYSIS_LOAD_ERROR]: loadError,
  [KEY_ARE_RESULTS_SHOWN]: areResultsShown, 
}, tracing);

export const getActiveAnalysisId = (state: GenericState): AnalysisId => state[KEY_ACTIVE_ANALYSIS_ID]; 

export const getActiveAnalysis = createSelector(
  getActiveAnalysisId,
  (analysisId) => {
    if (analysisId !== null) {
      return require(`analyses/${analysisId}`) as Analysis;
    }
    return null;
  }
);

export const getActiveAnalysisSteps = createSelector(
  getActiveAnalysis,
  (analysis) => analysis === null ? [] : getStepsForAnalysis(analysis),
);

export const findStepBySymbol = createSelector(
  getActiveAnalysisSteps,
  (steps) => (symbol: string): CephaloLandmark | null => {
    return find(steps, (step: CephaloLandmark) => step.symbol === symbol) || null;
  }
);

export const getManualSteps = createSelector(
  getActiveAnalysisSteps,
  (steps) => filter(steps, isStepManual),
);

export const getExpectedNextManualLandmark = createSelector(
  getManualSteps,
  getManualLandmarks,
  (manualSteps, manualLandmarks): CephaloLandmark | null => (find(
    manualSteps,
    step => manualLandmarks[step.symbol] === undefined,
  ) || null),
);

export const getManualStepState = createSelector(
  getManualLandmarks,
  getExpectedNextManualLandmark,
  (manualLandmarks, next) => (landmark: CephaloLandmark): StepState => {
    if (manualLandmarks[landmark.symbol] !== undefined) {
      return 'done';
    } else if (next && next.symbol === landmark.symbol) {
      return 'current'
    } else {
      return 'pending';
    }
  },
);

export const getStepState = createSelector(
  getAllLandmarksSelector,
  getManualStepState,
  getComputedValues,
  (allLandmarks, getManualStepState, computedValues) => (step: CephaloLandmark): StepState => {
    if (allLandmarks[step.symbol] !== undefined) {
      return 'done';
    } else if (computedValues[step.symbol] !== undefined) {
      return 'done';
    } else {
      return getManualStepState(step);
    }
  }
);

export {
  isLandmarkRemovable,
};
