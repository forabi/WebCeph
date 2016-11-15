import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

import assign from 'lodash/assign';
import every from 'lodash/every';
import filter from 'lodash/filter';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import memoize from 'lodash/memoize';

import { printUnexpectedPayloadWarning } from 'utils/debug';

import tracing, {
  isLandmarkRemovable,
  getCephaloMapper,
  getManualLandmarksForImage,
  getManualLandmarksHistory,
} from 'store/reducers/workspace/tracing';

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

const defaultAnalysisId: AnalysisId = { };

const activeAnalysisIdReducer = handleActions<AnalysisId, any>(
  {
    [Event.SET_ANALYSIS_SUCCEEDED]: (state, action) => {
      const { payload: analysisId } = action;
      if (analysisId === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return analysisId as Payloads.analysisLoadSucceeded;
    },
  },
  defaultAnalysisId,
);

const isAnalysisLoadingReducer = handleActions<IsAnalysisLoading, any>(
  {
    [Event.SET_ANALYSIS_REQUESTED]: () => true,
    [Event.SET_ANALYSIS_SUCCEEDED]: () => false,
    [Event.SET_ANALYSIS_FAILED]: () => false,
  },
  false,
);

const loadErrorReducer = handleActions<LoadError, any>(
  {
    [Event.SET_ANALYSIS_SUCCEEDED]: () => null,
    [Event.SET_ANALYSIS_FAILED]: (state, { type, payload: error }) => {
      if (error === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return error as Payloads.analysisLoadFailed;
    },
    [Event.SET_ANALYSIS_REQUESTED]: () => null,
  },
  null,
);

const areResultsShownReducer = handleActions<AreResultsShown, any>(
  {
    [Event.SHOW_ANALYSIS_RESULTS_REQUESTED]: () => true,
    [Event.CLOSE_ANALYSIS_RESULTS_REQUESTED]: () => false,
    [Event.RESET_WORKSPACE_REQUESTED]: () => false,
  },
  false,
);

const KEY_ACTIVE_ANALYSIS_ID = StoreKeys.activeAnalysisId;
const KEY_ARE_RESULTS_SHOWN = StoreKeys.areResultsShown;
const KEY_IS_ANALYSIS_LOADING = StoreKeys.isAnalysisLoading;
const KEY_ANALYSIS_LOAD_ERROR = StoreKeys.analysisLoadError;

export default assign({
  [KEY_ACTIVE_ANALYSIS_ID]: activeAnalysisIdReducer,
  [KEY_IS_ANALYSIS_LOADING]: isAnalysisLoadingReducer,
  [KEY_ANALYSIS_LOAD_ERROR]: loadErrorReducer,
  [KEY_ARE_RESULTS_SHOWN]: areResultsShownReducer,
}, tracing);

export const areResultsShown = (state: GenericState): AreResultsShown => state[KEY_ARE_RESULTS_SHOWN];

export const getActiveAnalysisIdForAllImages = (
  state: GenericState,
) => state[KEY_ACTIVE_ANALYSIS_ID];

export const getActiveAnalysisIdForImage = (
  state: GenericState,
  { imageId }: { imageId: ImageId },
) => getActiveAnalysisIdForAllImages(state)[imageId];

export const isAnalysisSet = createSelector(
  getActiveAnalysisIdForImage,
  (id) => id !== null,
);

export const isAnalysisLoading = (state: GenericState): IsAnalysisLoading => state[KEY_IS_ANALYSIS_LOADING];

// @FIXME: dynamically require analysis
import downs from 'analyses/downs';
import basic from 'analyses/basic';
import bjork from 'analyses/bjork';
import common from 'analyses/basic';
import dental from 'analyses/dental';

const analyses: { [id: string]: Analysis } = {
  downs,
  basic,
  bjork,
  common,
  dental,
};

export const getActiveAnalysis = createSelector(
  getActiveAnalysisIdForImage,
  (analysisId): Analysis | null => {
    if (analysisId !== null) {
      return analyses[analysisId] as Analysis;
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
);

export const getActiveAnalysisSteps = createSelector(
  getActiveAnalysis,
  (analysis) => analysis === null ? [] : getStepsForAnalysis(analysis),
);


export const getAllPossibleActiveAnalysisSteps = createSelector(
  getActiveAnalysis,
  (analysis) => analysis === null ? [] : getStepsForAnalysis(analysis, false),
);

export const findStepBySymbol = createSelector(
  getAllPossibleActiveAnalysisSteps,
  getActiveAnalysisSteps,
  (steps, deduplicatedSteps) => (symbol: string, includeDuplicates = true): CephaloLandmark | null => {
    return find(
      includeDuplicates ? steps : deduplicatedSteps,
      (step: CephaloLandmark) => step.symbol === symbol
    ) || null;
  }
);

export const getManualSteps = createSelector(
  getActiveAnalysisSteps,
  (steps) => filter(steps, isStepManual),
);

export const getExpectedNextManualLandmark = createSelector(
  getManualSteps,
  getManualLandmarksForImage,
  (manualSteps, manualLandmarks): CephaloLandmark | null => (find(
    manualSteps,
    step => manualLandmarks[step.symbol] === undefined,
  ) || null),
);

export const getManualStepState = createSelector(
  getManualLandmarksForImage,
  getExpectedNextManualLandmark,
  (manualLandmarks, next) => (symbol: string): StepState => {
    if (manualLandmarks[symbol] !== undefined) {
      return 'done';
    } else if (next && next.symbol === symbol) {
      return 'current';
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
  getAllPossibleActiveAnalysisSteps,
  (steps) => memoize(((step: CephaloLandmark): CephaloLandmark[] => {
    const cs = filter(steps, s => !areEqualSymbols(step, s) && areEqualSteps(step, s)) || [];
    return cs;
  })),
);

export const isStepEligibleForAutomaticMapping = createSelector(
  getManualStepState,
  (getState) => {
    const fn = (s: CephaloLandmark): boolean => {
      if (isStepManual(s)) {
        return false;
      }
      return every(s.components, c => {
        if (isCephaloPoint(c)) {
          const state = getState(c.symbol);
          return state === 'done';
        }
        return fn(c);
      });
    };
    return fn;
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
        }
        for (const equalStep of findEqual(step)) {
          const r = tryMap(equalStep, mapper);
          if (r) {
            result[equalStep.symbol] = r;
          }
        }
      }
    }
    return result;
  },
);

export const getAllLandmarks = createSelector(
  getManualLandmarksForImage,
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
  (allLandmarks, getStep, computedValues) => (symbol: string): StepState => {
    if (allLandmarks[symbol] !== undefined) {
      return 'done';
    } else if (computedValues[symbol] !== undefined) {
      return 'done';
    } else {
      return getStep(symbol);
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
      console.warn(
        `Tried to get nested components for landmark ${symbol}, ` +
        `but the active analysis does not have a landmark with that symbol. ` +
        `Returning an empty array.`,
      );
      return [];
    }
  }),
);

export const getLandmarkWithAllNestedLandmarks = createSelector(
  findStepBySymbol,
  getComponentWithAllPossibleNestedComponents,
  getCephaloMapper,
  (findStep, getWithNested, mapper) => (symbol: string) => {
    type TResult = { [symbol: string]: GeometricalObject | undefined } | { };
    return reduce<TResult, TResult>(
      map(
        getWithNested(symbol),
        l => {
          const step = findStep(l.symbol);
          if (step !== null) {
            return { [l.symbol]: tryMap(step, mapper) };
          }
          return { };
        },
      ),
      assign,
      { },
    );
  },
);

export const getAllLandmarksAndValues = createSelector(
  getAllLandmarks,
  getComputedValues,
  (landmarks, values): { [symbol: string]: EvaluatedValue } => assign({ }, landmarks, values),
);

export const getAnalysisResults = createSelector(
  getActiveAnalysis,
  getAllLandmarksAndValues,
  (analysis, evaluatedValues) => {
    if (analysis !== null) {
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
      (resultsInCategory: AnalysisInterpretation[], indication: number) => ({
        category: indication,
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
            },
          ))),
        )),
      }),
    );
  },
);

export const canShowResults = createSelector(
  getCategorizedAnalysisResults,
  (results) => !isEmpty(results),
);

export {
  isLandmarkRemovable,
  getManualLandmarksForImage,
  getManualLandmarksHistory,
};
