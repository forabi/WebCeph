import { getStepsForAnalysis, flipVector, evaluate } from '../../analyses/helpers';
import { createSelector } from 'reselect';
import filter from 'lodash/filter';
import has from 'lodash/has';
import every from 'lodash/every';
import find from 'lodash/find';
import map from 'lodash/map';
import assign from 'lodash/assign';
import flatten from 'lodash/flatten';
import mapValues from 'lodash/mapValues';

import { manualLandmarksSelector } from '../reducers/manualLandmarks';

export { manualLandmarksSelector };

const activeAnalysisSelector = (state: StoreState) => state['cephalo.workspace.analysis.activeAnalysis'];

const imageDataSelector = (state: StoreState) => state['cephalo.workspace.image.data'];

export const stepsBeingEvaluatedSelector = (state: StoreState) => state['cephalo.workspace.analysis.stepsBeingEvaluated'];

export const activeAnalysisStepsSelector = createSelector(
  activeAnalysisSelector,
  analysis => {
    if (analysis !== null) {
      return getStepsForAnalysis(analysis);
    }
    return [];
  }
);

export const expectedNextLandmarkSelector = createSelector(
  activeAnalysisStepsSelector,
  manualLandmarksSelector,
  (steps, setLandmarks) => (find(
    steps,
    x => x.type === 'point' && !has(setLandmarks, x.symbol),
  ) || null) as CephaloLandmark | null,
);

export const getManualStepStateSelector = createSelector(
  stepsBeingEvaluatedSelector,
  manualLandmarksSelector,
  expectedNextLandmarkSelector,
  (stepsBeingEvaluated, manualLandmarks, expectedLandmark) => (landmark: CephaloLandmark): StepState => {
    if (has(manualLandmarks, landmark.symbol)) {
      return 'done';
    } else if (has(stepsBeingEvaluated, landmark.symbol)) {
      return 'evaluating';
    } else if (expectedLandmark && expectedLandmark.symbol === landmark.symbol) {
      return 'current';
    } else {
      return 'pending';
    }
  },
);

export const cephaloMapperSelector = createSelector(
  manualLandmarksSelector,
  (manualLandmarks): CephaloMapper => {
    const toPoint = (cephaloPoint: CephaloPoint) => {
      return manualLandmarks[cephaloPoint.symbol] as GeometricalPoint;
    };
    
    const toVector = (cephaloLine: CephaloLine) => {
      const A = toPoint(cephaloLine.components[0]);
      const B = toPoint(cephaloLine.components[1]);
      return {
        x1: A.x,
        y1: A.y,
        x2: B.x,
        y2: B.y,
      };
    };

    const toVectors = (cephaloLine: CephaloLine) => {
      return compact([
        toVector(cephaloLine),
        toVector(flipVector(cephaloLine)),
      ]) as GeometricalLine[];
    };
    // @TODO: Handle scale factor
    return { toPoint, toVectors, toVector, scaleFactor: 1 / 3.2 };
  }
);

import {
  mapSeverityToString,
  mapTypeToIndication,
  isSkeletalPattern,
  isSkeletalProfile,
  isMaxilla, isMandible,
  isMandiblularRotation,
  isGrowthPattern,
} from '../../analyses/helpers';
import keyBy from 'lodash/keyBy';
import compact from 'lodash/compact';

export const isAnalysisActiveSelector = createSelector(
  activeAnalysisSelector,
  imageDataSelector,
  (analysis, data) => (
      analysis !== null && data !== null
  ),
);

export const completedStepsSelector = createSelector(
  activeAnalysisStepsSelector,
  manualLandmarksSelector,
  (steps, setLandmarks) => filter(steps, s => has(setLandmarks, s.symbol)),
);


export const getPendingStepsSelector = createSelector(
  activeAnalysisStepsSelector,
  getManualStepStateSelector,
  (steps, getStepState) => {
    return filter(steps, s => getStepState(s) === 'pending');
  },
)

const tryEvaluate = (mapper: CephaloMapper) => (s: CephaloLandmark) => {
  try {
    const value = evaluate(s, mapper);
    return { id: s.symbol, value };
  } catch (_) {
    return undefined;
  }
};

export const automaticLandmarksSelector = createSelector(
  getPendingStepsSelector,
  cephaloMapperSelector,
  (pending, mapper) => {
    return mapValues(keyBy(compact(flatten(map(
      pending,
      step => {
        if (step.type === 'line') {
          return [step, flipVector(step)].map(tryEvaluate(mapper));
        }
        return tryEvaluate(mapper)(step);
      }
    ))), s => s.id), v => v.value) as { [symbol: string]: EvaluatedValue } ;
  },
)

export const getAllLandmarksSelector = createSelector(
  manualLandmarksSelector,
  automaticLandmarksSelector,
  (manual, automatic) => {
    return assign({ }, manual, automatic) as { [symbol: string]: EvaluatedValue };
  }
);

export const getLandmarkValueSelector = createSelector(
  getAllLandmarksSelector,
  (allLandmarks) => (step: Step | CephaloLandmark) => allLandmarks[step.symbol],
);


export const getViewableResultSelector = createSelector(
  activeAnalysisSelector,
  getLandmarkValueSelector,
  (analysis, getValue) => {
    return function mapResultToViewableResult(result: AnalysisResult): ViewableAnalysisResult {
      if (analysis === null) throw TypeError('Did not expect analysis to be null');
      let name = 'Unknown';
      if (isSkeletalPattern(result.type)) {
        name = 'Skeletal Pattern';
      } else if (isSkeletalProfile(result.type)) {
        name = 'Skeletal Profile';
      } else if (isMaxilla(result.type)) {
        name = 'Maxilla';
      } else if (isMandible(result.type)) {
        name = 'Mandible';
      } else if (isMandiblularRotation(result.type)) {
        name = 'Mandiblular Rotation';
      } else if (isGrowthPattern(result.type)) {
        name = 'Growth Pattern';
      } else {
        console.warn(
          'Cannot find name for analysis result',
          result,
        );
      }
      if (result.relevantComponents && result.relevantComponents.length) {
        const indexed = keyBy(analysis.components, c => c.landmark.symbol);
        return {
          name,
          relevantComponents: compact(map(
            result.relevantComponents,
            c => {
              const v = getValue(indexed[c].landmark);
              if (typeof v !== 'number') return null;
              return {
                norm: indexed[c].norm,
                stdDev: indexed[c].stdDev,
                symbol: indexed[c].landmark.symbol,
                value: v,
              };
            },
          )),
          severity: mapSeverityToString(result.severity),
          indicates: mapTypeToIndication(result.type),
        } as ViewableAnalysisResultWithValue;
      } else {
        return {
          name,
          severity: mapSeverityToString(result.severity),
          indicates: mapTypeToIndication(result.type),
        } as BaseViewableAnalysisResult;
      }
    };
  }
);

export const isAnalysisCompleteSelector = createSelector(
  getAllLandmarksSelector,
  activeAnalysisSelector,
  (allLandmarks, activeAnalysis) => {
    if (!activeAnalysis) return false;
    return every(activeAnalysis.components, step => has(allLandmarks, step.landmark.symbol));
  },
);

export const getAnalysisResultsSelector = createSelector(
  activeAnalysisSelector,
  isAnalysisCompleteSelector,
  getAllLandmarksSelector,
  getViewableResultSelector,
  (analysis, isComplete, values, getViewable): ViewableAnalysisResult[] => {
    if (analysis !== null && isComplete) {
      return map(analysis.interpret(values), getViewable);
    }
    return [];
  }
);

export const getAnyStepStateSelector = createSelector(
  getAllLandmarksSelector,
  getManualStepStateSelector,
  (allLandmarks, getManualStepState) => (step: CephaloLandmark): StepState => {
    if (allLandmarks[step.symbol] !== undefined) {
      return 'done';
    } else {
      return getManualStepState(step);
    }
  }
);

import {
  loadImageFile,
  addManualLandmark,
  tryAutomaticSteps,
} from '../../actions/workspace';

export const onCanvasClickedSelector = createSelector(
  expectedNextLandmarkSelector,
  expectedLandmark => (dispatch: Function) => {
    return (e => {
      if (expectedLandmark) {
        dispatch(
          addManualLandmark(expectedLandmark.symbol, { x: e.X, y: e.Y })
        );
        dispatch(tryAutomaticSteps());
      }
    }) as (e: { X: number, Y: number }) => void;
  },
);

const canvasHeightSelector = (state: StoreState) => state['cephalo.workspace.canvas.height'];
const canvasWidthSelector = (state: StoreState) => state['cephalo.workspace.canvas.width'];

export const onFileDroppedSelector = createSelector(
  canvasHeightSelector,
  canvasWidthSelector,
  (height, width) => (dispatch: Function) => {
    return ((file: File) => {
      dispatch(loadImageFile({ file, height, width }));
    }) as (file: File) => void;
  },
);
