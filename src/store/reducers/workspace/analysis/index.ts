import { createSelector } from 'reselect';

import assign from 'lodash/assign';
import every from 'lodash/every';
import some from 'lodash/some';
import filter from 'lodash/filter';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import map from 'lodash/map';
import memoize from 'lodash/memoize';


import {
  getStepsForAnalysis,
  areEqualSteps,
  areEqualSymbols,
  isStepManual,
  isStepComputable,
  tryCalculate,
  tryMap,
} from 'analyses/helpers';

const defaultAnalysisId: AnalysisId<'ceph_lateral'> = 'common';





export const areResultsShown = (state: StoreState): AreResultsShown => state[KEY_ARE_RESULTS_SHOWN];

export const getActiveAnalysisId = (state: StoreState): AnalysisId => state[KEY_ACTIVE_ANALYSIS_ID];

export const isAnalysisSet = createSelector(
  getActiveAnalysisId,
  (id) => id !== null,
);

export const isAnalysisLoading = (state: StoreState): IsAnalysisLoading => state[KEY_IS_ANALYSIS_LOADING];

// @FIXME: dynamically require analysis
import downs from 'analyses/downs';
import basic from 'analyses/basic';
import bjork from 'analyses/bjork';
import common from 'analyses/common';
import dental from 'analyses/dental';
import softTissues from 'analyses/softTissues';

const analyses: Record<string, Analysis<ImageType>> = {
  downs,
  basic,
  bjork,
  common,
  dental,
  softTissues,
};

export const getActiveAnalysis = createSelector(
  getActiveAnalysisId,
  (analysisId) => {
    if (analysisId !== null) {
      return analyses[analysisId] as Analysis<ImageType>;
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
  (steps, deduplicatedSteps) => (symbol: string, includeDuplicates = true): CephLandmark | null => {
    return find(
      includeDuplicates ? steps : deduplicatedSteps,
      (step: CephLandmark) => step.symbol === symbol
    ) || null;
  },
);

export const getManualSteps = createSelector(
  getActiveAnalysisSteps,
  (steps) => filter(steps, isStepManual),
);

export const getExpectedNextManualLandmark = createSelector(
  getManualSteps,
  getManualLandmarks,
  (manualSteps, { present: manualLandmarks }): CephLandmark | null => (find(
    manualSteps,
    step => manualLandmarks[step.symbol] === undefined,
  ) || null),
);

export const getManualStepState = createSelector(
  getManualLandmarks,
  getExpectedNextManualLandmark,
  ({ present: manualLandmarks }, next) => (symbol: string): StepState => {
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
  (steps) => memoize(((step: CephLandmark): CephLandmark[] => {
    const cs = filter(steps, s => !areEqualSymbols(step, s) && areEqualSteps(step, s)) || [];
    return cs;
  })),
);

export const isStepEligibleForAutomaticMapping = createSelector(
  getManualStepState,
  (getState) => {
    const fn = (s: CephLandmark): boolean => {
      if (isStepManual(s)) {
        return false;
      }
      return every(s.components, c => {
        if (isStepManual(c)) {
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
    const result: { [symbol: string]: GeoObject } = { };
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

export const getAllGeoObjects = createSelector(
  getManualLandmarks,
  getAutomaticLandmarks,
  ({ present: manual }, automatic) => {
    return { ...manual, ...automatic };
  }
);

export const isStepEligibleForComputation = createSelector(
  getAllGeoObjects,
  findEqualComponents,
  (allLandmarks, findEqual) => (step: CephLandmark) => {
    return (
      isStepComputable(step) &&
      every(step.components, (c: CephLandmark) => some(
        [c, ...findEqual(c)],
        eq => allLandmarks[eq.symbol] !== undefined
      ))
    );
  }
);

export const getComputedValues = createSelector(
  getActiveAnalysisSteps,
  isStepEligibleForComputation,
  (steps, isEligible) => {
    const result: { [symbol: string]: number } = { };
    for (const step of steps) {
      if (isEligible(step)) {
        const value = tryCalculate(step);
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

/**
 * Determines whether a landmark that was defined with a `calculate`
 * method has been calculated. Returns true if the landmark does
 * not define a `calculate` method.
 */
export const isStepCalculationComplete = createSelector(
  getComputedValues,
  (values) => (step: CephLandmark) => {
    if (isStepComputable(step)) {
      return typeof values[step.symbol] !== 'undefined';
    }
    return true;
  },
);

/**
 * Determines whether a landmark that was defined with a `map`
 * method has been mapped. Returns true if the landmark does
 * not define a `map` method.
 */
export const isStepMappingComplete = createSelector(
  getAllGeoObjects,
  (objects) => (step: CephLandmark) => {
    if (isStepComputable(step)) {
      return typeof objects[step.symbol] !== 'undefined';
    }
    return true;
  },
);

/**
 * Determines whether a landmark has been mapped and/or calculated.
 */
export const isStepComplete = createSelector(
  isStepMappingComplete,
  isStepCalculationComplete,
  (isMapped, isCalculated) => (step: CephLandmark) => {
    return isMapped(step) && isCalculated(step);
  },
);

/**
 * Determines whether all the components that the active analysis
 * is composed of were mapped and/or calculated.
 */
export const isAnalysisComplete = createSelector(
  getActiveAnalysis,
  isStepComplete,
  (analysis, isComplete) => {
    if (analysis !== null) {
      return every(analysis.components, isComplete);
    }
    return false;
  },
);

export const getAllPossibleNestedComponents = createSelector(
  findEqualComponents,
  (findEqual) => {
    const fn = memoize((landmark: CephLandmark): CephLandmark[] => {
      let additional: CephLandmark[] = [];
      for (const subcomponent of landmark.components) {
        additional = additional.concat([
          subcomponent,
          ...subcomponent.components,
          ...findEqual(subcomponent),
          ...flatten(map(subcomponent.components, fn)),
        ]);
      }
      return additional;
    });
    return fn;
  },
);

export const getComponentWithAllPossibleNestedComponents = createSelector(
  findStepBySymbol,
  getAllPossibleNestedComponents,
  (findBySymbol, getAllNested) => memoize((symbol: string): CephLandmark[] => {
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

export const getGeometricalRepresentationBySymbol = createSelector(
  findStepBySymbol,
  getComponentWithAllPossibleNestedComponents,
  getCephaloMapper,
  (findStep, getWithNested, mapper) => memoize((symbol: string) => {
    type TResult = { [symbol: string]: GeoObject };
    return reduce<TResult, TResult>(
      map(
        getWithNested(symbol),
        l => {
          const step = findStep(l.symbol);
          if (step !== null) {
            const mapped = tryMap(step, mapper);
            if (mapped !== undefined) {
              return {
                [l.symbol]: mapped,
              };
            }
          }
          return { };
        },
      ),
      assign,
      { },
    );
  }),
);


export const getCategorizedAnalysisResults = createSelector(
  getActiveAnalysis,
  getComputedValues,
  getAllGeoObjects,
  (analysis, values, objects): Array<CategorizedAnalysisResult<Category>> => {
    if (analysis !== null) {
      return analysis.interpret(values, objects);
    }
    return [];
  },
);

export const canShowResults = createSelector(
  getCategorizedAnalysisResults,
  (results) => !isEmpty(results),
);
