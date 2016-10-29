import { handleActions } from 'redux-actions';
import assign from 'lodash/assign';
import filter from 'lodash/filter';
import find from 'lodash/find';
import every from 'lodash/every';
import memoize from 'lodash/memoize';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import map from 'lodash/map';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import tracing, {
  isLandmarkRemovable,
  getManualLandmarks,
  getCephaloMapper,
} from './tracing';
import { createSelector } from 'reselect';
import { StoreKeys, Event } from 'utils/constants';
import {
  getStepsForAnalysis,
  areEqualSteps,
  areEqualSymbols,
  isStepManual,
  isStepComputable,
  compute,
  tryMap,
  resolveIndication,
  resolveSeverity,
  isCephaloPoint,
} from 'analyses/helpers';

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

export const findAnalysisComponentBySymbol = createSelector(
  getActiveAnalysis,
  (analysis) => memoize((symbol: string) => {
    if (analysis !== null) {
      return find(
        analysis.components,
        (c) => symbol === c.landmark.symbol
      ) || null;
    }
    return null;
  }),
)

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
  (manualLandmarks, next) => (symbol: string): StepState => {
    if (manualLandmarks[symbol] !== undefined) {
      return 'done';
    } else if (next && next.symbol === symbol) {
      return 'current'
    } else {
      return 'pending';
    }
  },
);

export const getPendingSteps = createSelector(
  getActiveAnalysisSteps,
  getManualStepState,
  (steps, getStepState) => {
    return filter(steps, s => getStepState(s.symbol) === 'pending');
  },
);

export const findEqualComponents = createSelector(
  getActiveAnalysis,
  (analysis) => memoize(((step: CephaloLandmark): CephaloLandmark[] => {
    if (!analysis) return [];
    const steps = getStepsForAnalysis(analysis, false);
    const cs = filter(steps, s => !areEqualSymbols(step, s) && areEqualSteps(step, s)) || [];
    return cs;
  })),
);

export const isStepEligibleForAutomaticMapping = createSelector(
  getManualStepState,
  (getManualStepState) => function isStepEligibleForAutomaticMapping(s: CephaloLandmark): boolean {
    if (isStepManual(s)) return false;
    return every(s.components, c => {
      if (isCephaloPoint(c)) {
        const state = getManualStepState(c.symbol);
        return state === 'done';
      }
      return isStepEligibleForAutomaticMapping(c);
    });
  },
);

export const getAutomaticLandmarks = createSelector(
  getPendingSteps,
  getCephaloMapper,
  isStepEligibleForAutomaticMapping,
  findEqualComponents,
  (pending, mapper, isEligible, findEqual) => {
    const result: { [symbol: string]: GeometricalObject } = { };
    for (const step of pending) {
      if (isEligible(step)) {
        const r = tryMap(step, mapper);
        if (r) {
          result[step.symbol] = r;
        };
        for (const equalStep of findEqual(step)) {
          const r = tryMap(equalStep, mapper);
          if (r) {
            result[equalStep.symbol] = r;
          };
        }
      }
    }
    return result;
  },
);

export const getAllLandmarks = createSelector(
  getManualLandmarks,
  getAutomaticLandmarks,
  (manual, automatic) => {
    return assign({ }, manual, automatic);
  }
);

export const isStepEligibleForComputation = createSelector(
  getAllLandmarks,
  (allLandmarks) => (step: CephaloLandmark) => {
    return (
      isStepComputable(step) && 
      every(step.components, (c: CephaloLandmark) => allLandmarks[c.symbol] !== undefined)
    );
  }
);

export const getComputedValues = createSelector(
  getActiveAnalysisSteps,
  isStepEligibleForComputation,
  getCephaloMapper,
  (steps, isEligible, mapper) => {
    const result: { [symbol: string]: number } = { };
    for (const step of steps) {
      if (isEligible(step)) {
        const value = compute(step, mapper);
        if (value !== undefined) {
          result[step.symbol] = value;
        } else {
          console.warn(
            `Step ${step.symbol} was eligible for automatic ` + 
            `computation but a value could not be computed.`,
          );
        }
      }
    }
    return result;
  },
);

export const getComputedValueBySymbol = createSelector(
  getComputedValues,
  (computedValues) => (symbol: string) => computedValues[symbol] || undefined,
);

export const getStepStateBySymbol = createSelector(
  getAllLandmarks,
  getManualStepState,
  getComputedValues,
  (allLandmarks, getManualStepState, computedValues) => (symbol: string): StepState => {
    if (allLandmarks[symbol] !== undefined) {
      return 'done';
    } else if (computedValues[symbol] !== undefined) {
      return 'done';
    } else {
      return getManualStepState(symbol);
    }
  }
);

export const isAnalysisComplete = createSelector(
  getActiveAnalysis,
  getAllLandmarks,
  getComputedValues,
  (analysis, allLandmarks, computedValues): boolean => {
    if (analysis !== null) {
      return every(analysis.components, step => {
        return (
          allLandmarks[step.landmark.symbol] !== undefined ||
          computedValues[step.landmark.symbol] !== undefined
        );
      });
    }
    return false;
  },
);

export const getAllPossibleNestedComponents = createSelector(
  findEqualComponents,
  (findEqual) => {
    const fn = memoize((landmark: CephaloLandmark): CephaloLandmark[] => {
      let additional: CephaloLandmark[] = [];
      for (const subcomponent of landmark.components) {
        additional = [
          ...additional,
          subcomponent,
          ...subcomponent.components,
          ...findEqual(subcomponent),
          ...flatten(map(subcomponent.components, fn)),
        ];
      }
      return additional;
    });
    return fn;
  },
);

export const getComponentWithAllPossibleNestedComponents = createSelector(
  findStepBySymbol,
  getAllPossibleNestedComponents,
  (findBySymbol, getAllNested) => memoize((symbol: string): CephaloLandmark[] => {
    const landmark = findBySymbol(symbol);
    if (landmark !== null) {
      return [landmark, ...getAllNested(landmark)];
    } else {
      __DEBUG__ && console.warn(
        `Tried to get nested components for landmark ${symbol}, ` +  
        `but the active analysis does not have a landmark with that symbol. ` +
        `Returning an empty array.`,
      );
      return [];
    }
  }),
);

export const getAllLandmarksAndValues = createSelector(
  getAllLandmarks,
  getComputedValues,
  (landmarks, values): { [symbol: string]: EvaluatedValue } => assign({ }, landmarks, values),
);

export const getAnalysisResults = createSelector(
  getActiveAnalysis,
  isAnalysisComplete,
  getAllLandmarksAndValues,
  (analysis, isComplete, evaluatedValues) => {
    if (analysis !== null && isComplete) {
      return analysis.interpret(evaluatedValues);
    }
    return [];
  }
);

export const getCategorizedAnalysisResults = createSelector(
  getAnalysisResults,
  findStepBySymbol,
  getComputedValueBySymbol,
  findAnalysisComponentBySymbol,
  getAllLandmarksAndValues,
  (results, findStep, getValue, findComponent, evaluatedValues): CategorizedAnalysisResults => {
    return map(
      groupBy(results, result => result.indication),
      (resultsInCategory: AnalysisResult[], category: string) => ({
        category,
        indication: resolveIndication(resultsInCategory, evaluatedValues),
        severity: resolveSeverity(resultsInCategory),
        relevantComponents: flatten(map(
          resultsInCategory,
          ({ relevantComponents }) => (flatten(map(
            map(relevantComponents, findStep),
            ({ symbol }: CephaloLandmark) => {
              const { stdDev, norm } = findComponent(symbol) as AnalysisComponent;
              return {
                symbol: symbol,
                value: getValue(symbol) as number,
                stdDev,
                norm,
              };
            }
          ))),
        )),
      }),
    );
  },
)

export {
  isLandmarkRemovable,
};
