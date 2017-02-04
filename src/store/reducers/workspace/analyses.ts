import { createSelector } from 'reselect';
import { handleActions } from 'utils/store';

import every from 'lodash/every';
import some from 'lodash/some';
import filter from 'lodash/filter';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import memoize from 'lodash/memoize';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

import {
  getManualLandmarks,
  getSkippedSteps,
  getAnalysisId,
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

const KEY_ANALYSIS_LOAD_STATUS: StoreKey = 'analyses.status';
const KEY_LAST_USED_ID: StoreKey = 'analyses.lastUsedId';
const KEY_SUMMARY_SHOWN: StoreKey = 'analyses.summary.isShown';

const analysisLoadStatusReducer = handleActions<typeof KEY_ANALYSIS_LOAD_STATUS>({
  SET_ANALYSIS_REQUESTED: (state, { payload: { analysisId, imageType } }) => {
    return {
      ...state,
      [imageType]: {
        ...state[imageType],
        [analysisId]: {
          isLoading: true,
          error: null,
        },
      },
    };
  },
  FETCH_ANALYSIS_FAILED: (state, { payload: { analysisId, imageType, error } }) => {
    return {
      ...state,
      [imageType]: {
        ...state[imageType],
        [analysisId]: {
          isLoading: false,
          error,
        },
      },
    };
  },
  FETCH_ANALYSIS_SUCCEEDED: (state, { payload: { analysisId, imageType } }) => {
    return {
      ...state,
      [imageType]: {
        ...state[imageType],
        [analysisId]: {
          isLoading: false,
          error: null,
        },
      },
    };
  },
}, { });

const reducers: Partial<ReducerMap> = {
  [KEY_ANALYSIS_LOAD_STATUS]: analysisLoadStatusReducer,
  [KEY_LAST_USED_ID]: handleActions<typeof KEY_LAST_USED_ID>({
    SET_ANALYSIS_REQUESTED: (state, { payload: { imageType, analysisId } }) => {
      return {
        ...state,
        [imageType]: analysisId,
      };
    },
  }, {
    ceph_lateral: 'ricketts_lateral',
    ceph_pa: 'ricketts_frontal',
    photo_frontal: 'frontal_face_proportions',
    photo_lateral: 'soft_tissues_photo_lateral',
    panoramic: 'panoramic_analysis',
  }),
  [KEY_SUMMARY_SHOWN]: handleActions<typeof KEY_SUMMARY_SHOWN>({
    TOGGLE_ANALYSIS_RESULTS_REQUESTED: (state) => !state,
  }, false),
};

export default reducers;

export const isSummaryShown = (state: StoreState) => state[KEY_SUMMARY_SHOWN];

export const isAnalysisSet = createSelector(
  getAnalysisId,
  (getId) => (imageId: string) => getId(imageId) !== null,
);

export const getActiveAnalysis = createSelector(
  getAnalysisId,
  (getAnalysisId) => (imageId: string) => {
    const analysisId = getAnalysisId(imageId);
    if (analysisId !== null) {
      return require(`analyses/${analysisId}`) as Analysis<ImageType>;
    }
    return null;
  },
);

export const getActiveAnalysisSteps = createSelector(
  getActiveAnalysis,
  (getAnalysis) => (imageId: string): CephLandmark[] => {
    const analysis = getAnalysis(imageId);
    return analysis === null ? [] : getStepsForAnalysis(analysis, false);
  },
);

export const getAllPossibleActiveAnalysisSteps = createSelector(
  getActiveAnalysis,
  (getAnalysis) => (imageId: string): CephLandmark[] => {
    const analysis = getAnalysis(imageId);
    return analysis === null ? [] : getStepsForAnalysis(analysis, false);
  },
);

type T = ((symbol: string, include: boolean) => null | CephLandmark);
export const findStepBySymbol = createSelector(
  getAllPossibleActiveAnalysisSteps,
  getActiveAnalysisSteps,
  (getSteps, getDeduplicatedSteps) => (imageId: string): T => {
    return (symbol: string, includeDuplicates = true): CephLandmark | null => {
      const steps = getSteps(imageId);
      const deduplicatedSteps = getDeduplicatedSteps(imageId);
      return find(
        includeDuplicates ? steps : deduplicatedSteps,
        (step: CephLandmark) => step.symbol === symbol,
      ) || null;
    };
  },
);

export const getManualSteps = createSelector(
  getActiveAnalysisSteps,
  (getSteps) => (imageId: string) => filter(getSteps(imageId), isStepManual),
);

export const isStepSkippable = isStepManual;
export const isStepRemovable = isStepManual;

export const getExpectedNextManualLandmark = createSelector(
  getManualSteps,
  getManualLandmarks,
  (getSteps, getManual) => (imageId: string): CephLandmark | null => {
    const manualLandmarks = getManual(imageId);
    const manualSteps = getSteps(imageId);
    return find(
      manualSteps,
      step => manualLandmarks[step.symbol] === undefined,
    ) || null;
  },
);

const EMPTY_ARRAY: CephLandmark[] = [];
type C = (step: CephLandmark) => CephLandmark[];
export const findEqualComponents = createSelector(
  getAllPossibleActiveAnalysisSteps,
  (getSteps) => (imageId: string): C => (step: CephLandmark): CephLandmark[] => {
    const steps = getSteps(imageId);
    const cs = filter(steps, s => !areEqualSymbols(step, s) && areEqualSteps(step, s)) || EMPTY_ARRAY;
    return cs;
  },
);

/**
 * Determines whether a landmark that was defined with a `map`
 * method has been mapped. Returns true if the landmark does
 * not define a `map` method.
 */
export const isManualStepMappingComplete = createSelector(
  getManualLandmarks,
  (getManual) => (imageId: string): ((step: CephLandmark) => boolean) => (step: CephLandmark) => {
    const objects = getManual(imageId);
    if (isStepMappable(step)) {
      return typeof objects[step.symbol] !== 'undefined';
    }
    return true;
  },
);

export const isManualStepComplete = isManualStepMappingComplete;

export const isStepEligibleForAutomaticMapping = createSelector(
  isManualStepComplete,
  (isComplete) => (imageId: string) => {
    const isEligible = (s: CephLandmark): boolean => {
      if (isStepManual(s)) {
        return false;
      }
      return every(s.components, subcomponent => {
        if (isStepManual(subcomponent)) {
          return isComplete(imageId)(subcomponent);
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
  (isEligible, getManual) => (imageId: string) => memoize((step: CephLandmark) => {
    const manual = getManual(imageId);
    if (isEligible(imageId)(step)) {
      return tryMap(step, manual);
    }
    return manual[step.symbol] || undefined;
  }),
);

type D = (step: CephLandmark) => boolean;
/**
 * Determines whether a landmark that was defined with a `map`
 * method has been mapped. Returns true if the landmark does
 * not define a `map` method.
 */
export const isStepMappingComplete = createSelector(
  getMappedValue,
  (getMapped) => (imageId: string): D => (step: CephLandmark) => {
    if (isStepMappable(step)) {
      return typeof getMapped(imageId)(step) !== 'undefined';
    }
    return true;
  },
);

export const isStepEligibleForComputation = createSelector(
  isStepMappingComplete,
  findEqualComponents,
  (isMapped, findEqual) => (imageId: string): D => (step: CephLandmark) => {
    return (
      isStepComputable(step) &&
      every(step.components, (c: CephLandmark) => some(
        [c, ...findEqual(imageId)(c)],
        eq => isMapped(imageId)(eq),
      ))
    );
  },
);

export const getCalculatedValue = createSelector(
  isStepEligibleForComputation,
  (isEligible) => (imageId: string): ((step: CephLandmark) => number | undefined) => (step: CephLandmark) => {
    if (isEligible(imageId)(step)) {
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
  (getValue) => (imageId: string): D => (step: CephLandmark) => {
    if (isStepComputable(step)) {
      return typeof getValue(imageId)(step) !== 'undefined';
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
  (isMapped, isCalculated) => (imageId: string): D => (step: CephLandmark) => {
    return isMapped(imageId)(step) && isCalculated(imageId)(step);
  },
);

export const isStepSkipped = createSelector(
  getSkippedSteps,
  (getSkipped) => (imageId: string): D => (s: CephLandmark) => getSkipped(imageId)[s.symbol] === true,
);

export const getStepStates = createSelector(
  getActiveAnalysisSteps,
  isStepComplete,
  isStepSkipped,
  getExpectedNextManualLandmark,
  (getSteps, isComplete, isSkipped, getNext) => (imageId: string) => {
    const steps = getSteps(imageId);
    const next = getNext(imageId);
    return mapValues(keyBy(steps, s => s.symbol), (s): StepState => {
      if (next !== null && next.symbol === s.symbol) {
        return 'current';
      } else if (isComplete(imageId)(s)) {
        return 'done';
      } else if (isSkipped(imageId)(s)) {
        return 'skipped';
      }
      return 'pending';
    });
  },
);

type E<T> = (s: CephLandmark) => T;
export const getStepState = createSelector(
  getStepStates,
  (getStates) => (imageId: string): E<StepState> => (s: CephLandmark) => getStates(imageId)[s.symbol],
);

/**
 * Get geometrical representation
 */
export const getAllGeoObjects = createSelector(
  getAllPossibleActiveAnalysisSteps,
  getMappedValue,
  (getSteps, getMapped) => (imageId: string) => {
    return mapValues(keyBy(getSteps(imageId), s => s.symbol), getMapped(imageId));
  },
);

/**
 * Determines whether all the components that the active analysis
 * is composed of were mapped and/or calculated.
 */
export const isAnalysisComplete = createSelector(
  getActiveAnalysis,
  isStepComplete,
  (getAnalysis, isComplete) => (imageId: string) => {
    const analysis = getAnalysis(imageId);
    if (analysis !== null) {
      return every(analysis.components, isComplete);
    }
    return false;
  },
);

export const getAllCalculatedValues = createSelector(
  getActiveAnalysisSteps,
  getCalculatedValue,
  (getSteps, getValue) => (imageId: string) => {
    const steps = getSteps(imageId);
    return mapValues(
      keyBy(steps, c => c.symbol),
      c => getValue(imageId)(c),
    );
  },
);

export const getCategorizedAnalysisResults = createSelector(
  getActiveAnalysis,
  getAllCalculatedValues,
  getAllGeoObjects,
  (getAnalysis, getValues, getObjects) => (imageId: string): Array<CategorizedAnalysisResult<Category>> => {
    const analysis = getAnalysis(imageId);
    const objects = getObjects(imageId);
    const values = getValues(imageId);
    if (analysis !== null) {
      return analysis.interpret(values, objects);
    }
    return [];
  },
);

export const canShowSummary = createSelector(
  getCategorizedAnalysisResults,
  (getResults) => (imageId: string) => !isEmpty(getResults(imageId)),
);
