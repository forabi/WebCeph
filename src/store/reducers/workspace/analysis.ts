import { createSelector } from 'reselect';

import every from 'lodash/every';
import some from 'lodash/some';
import filter from 'lodash/filter';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import memoize from 'lodash/memoize';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

import {
  getActiveManualLandmarks as getManualLandmarks,
  getActiveSkippedSteps as getSkippedSteps,
} from './image';

import {
  getStepsForAnalysis,
  areEqualSteps,
  areEqualSymbols,
  isStepManual,
  isStepComputable,
  isStepMappable,
  tryCalculate,
  tryMap,
} from 'analyses/helpers';

const defaultAnalysisId: AnalysisId<'ceph_lateral'> = 'common';

export const getActiveAnalysisId = (_: StoreState): AnalysisId<ImageType> => defaultAnalysisId;

export const isAnalysisSet = createSelector(
  getActiveAnalysisId,
  (id) => id !== null,
);

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
  },
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
      (step: CephLandmark) => step.symbol === symbol,
    ) || null;
  },
);

export const getManualSteps = createSelector(
  getActiveAnalysisSteps,
  (steps) => filter(steps, isStepManual),
);

export const isStepSkippable = isStepManual;
export const isStepRemovable = isStepManual;

export const getExpectedNextManualLandmark = createSelector(
  getManualSteps,
  getManualLandmarks,
  (manualSteps, manualLandmarks): CephLandmark | null => (find(
    manualSteps,
    step => manualLandmarks[step.symbol] === undefined,
  ) || null),
);

export const findEqualComponents = createSelector(
  getAllPossibleActiveAnalysisSteps,
  (steps) => memoize(((step: CephLandmark): CephLandmark[] => {
    const cs = filter(steps, s => !areEqualSymbols(step, s) && areEqualSteps(step, s)) || [];
    return cs;
  })),
);

/**
 * Determines whether a landmark that was defined with a `map`
 * method has been mapped. Returns true if the landmark does
 * not define a `map` method.
 */
export const isManualStepMappingComplete = createSelector(
  getManualLandmarks,
  (objects) => (step: CephLandmark) => {
    if (isStepMappable(step)) {
      return typeof objects[step.symbol] !== 'undefined';
    }
    return true;
  },
);

export const isManualStepComplete = isManualStepMappingComplete;

export const isStepEligibleForAutomaticMapping = createSelector(
  isManualStepComplete,
  (isComplete) => {
    const isEligible = (s: CephLandmark): boolean => {
      if (isStepManual(s)) {
        return false;
      }
      return every(s.components, subcomponent => {
        if (isStepManual(subcomponent)) {
          return isComplete(subcomponent);
        }
        return isEligible(subcomponent);
      });
    };
    return isEligible;
  },
);

export const getMappedValue = createSelector(
  isStepEligibleForAutomaticMapping,
  getManualLandmarks,
  (isEligible, manual) => memoize((step: CephLandmark) => {
    if (isEligible(step)) {
      return tryMap(step);
    }
    return manual[step.symbol] || undefined;
  }),
);

/**
 * Determines whether a landmark that was defined with a `map`
 * method has been mapped. Returns true if the landmark does
 * not define a `map` method.
 */
export const isStepMappingComplete = createSelector(
  getMappedValue,
  (getMapped) => (step: CephLandmark) => {
    if (isStepMappable(step)) {
      return typeof getMapped(step) !== 'undefined';
    }
    return true;
  },
);

export const isStepEligibleForComputation = createSelector(
  isStepMappingComplete,
  findEqualComponents,
  (isMapped, findEqual) => (step: CephLandmark) => {
    return (
      isStepComputable(step) &&
      every(step.components, (c: CephLandmark) => some(
        [c, ...findEqual(c)],
        eq => isMapped(eq),
      ))
    );
  },
);

export const getCalculatedValue = createSelector(
  isStepEligibleForComputation,
  (isEligible) => (step: CephLandmark) => {
    if (isEligible(step)) {
      return tryCalculate(step);
    }
    return undefined;
  },
);

/**
 * Determines whether a landmark that was defined with a `calculate`
 * method has been calculated. Returns true if the landmark does
 * not define a `calculate` method.
 */
export const isStepCalculationComplete = createSelector(
  getCalculatedValue,
  (getValue) => (step: CephLandmark) => {
    if (isStepComputable(step)) {
      return typeof getValue(step) !== 'undefined';
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

export const isStepSkipped = createSelector(
  getSkippedSteps,
  (skipped) => (s: CephLandmark) => skipped[s.symbol] === true,
);

export const getStepStates = createSelector(
  getActiveAnalysisSteps,
  isStepComplete,
  isStepSkipped,
  getExpectedNextManualLandmark,
  (steps, isComplete, isSkipped, next) => {
    return mapValues(keyBy(steps, s => s.symbol), (s): StepState => {
      if (next !== null && next.symbol === s.symbol) {
        return 'current';
      } else if (isComplete(s)) {
        return 'done';
      } else if (isSkipped(s)) {
        return 'skipped';
      }
      return 'pending';
    });
  },
);

export const getStepState = createSelector(
  getStepStates,
  (states) => (s: CephLandmark) => states[s.symbol],
);

/**
 * Get geometrical representation
 */
export const getAllGeoObjects = createSelector(
  getAllPossibleActiveAnalysisSteps,
  getMappedValue,
  (steps, getMapped) => {
    return mapValues(keyBy(steps, s => s.symbol), getMapped);
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

export const getAllCalculatedValues = createSelector(
  getActiveAnalysisSteps,
  getCalculatedValue,
  (steps, getValue) => {
    return mapValues(
      keyBy(steps, c => c.symbol),
      c => getValue(c),
    );
  },
);

export const getCategorizedAnalysisResults = createSelector(
  getActiveAnalysis,
  getAllCalculatedValues,
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
