import { createSelector } from 'reselect';

import keyBy from 'lodash/keyBy';
import compact from 'lodash/compact';
import filter from 'lodash/filter';
import has from 'lodash/has';
import every from 'lodash/every';
import find from 'lodash/find';
import map from 'lodash/map';
import assign from 'lodash/assign';
import uniqBy from 'lodash/uniqBy';
import memoize from 'lodash/memoize';

import {
  getStepsForAnalysis,
  compute,
  line,
  isStepManual, isStepComputable,
  mapSeverityToString,
  mapTypeToIndication,
  isSkeletalPattern,
  isSkeletalProfile,
  isMaxilla, isMandible,
  isMandiblularRotation,
  isLowerIncisorInclination,
  isUpperIncisorInclination,
  isGrowthPattern,
  isSkeletalBite,
  areEqualSteps, areEqualSymbols,
} from '../../analyses/helpers';

import { manualLandmarksSelector } from '../reducers/workspace/manualLandmarks';

export { manualLandmarksSelector };

export const canUndoSelector = ({ past }: EnhancedState<GenericState>) => past.length > 0;

export const canRedoSelector = ({ future }: EnhancedState<GenericState>) => future.length > 0;

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

export const findEqualComponentsSelector = createSelector(
  activeAnalysisSelector,
  (analysis) => memoize(((step: CephaloLandmark): CephaloLandmark[] => {
    if (!analysis) return [];
    const steps = getStepsForAnalysis(analysis, false);
    const cs = filter(steps, s => !areEqualSymbols(step, s) && areEqualSteps(step, s)) || [];
    return cs;
  })),
);

import flatten from 'lodash/flatten';

export const getExtendedVisualComponentsSelector = createSelector(
  findEqualComponentsSelector,
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
)

export const getComponentsForSymbolSelector = createSelector(
  activeAnalysisStepsSelector,
  getExtendedVisualComponentsSelector,
  (steps, getExtended) => memoize((symbol: string) => {
    const landmark = find(steps, { symbol });
    if (!landmark) {
      console.warn('Could not find landmark by symbol %s', symbol);
    }
    return [landmark, ...getExtended(landmark)];
  }),
);

export const nextManualLandmarkSelector = createSelector(
  activeAnalysisStepsSelector,
  manualLandmarksSelector,
  (steps, manualLandmarks) => (find(
    steps,
    x => isStepManual(x) && !has(manualLandmarks, x.symbol),
  ) || null) as CephaloLandmark | null,
);

export const getManualStepStateSelector = createSelector(
  stepsBeingEvaluatedSelector,
  manualLandmarksSelector,
  nextManualLandmarkSelector,
  (stepsBeingEvaluated, manualLandmarks, next) => (landmark: CephaloLandmark): StepState => {
    if (has(manualLandmarks, landmark.symbol)) {
      return 'done';
    } else if (has(stepsBeingEvaluated, landmark.symbol)) {
      return 'evaluating';
    } else if (next && next.symbol === landmark.symbol) {
      return 'current'
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

    const toAngle = (cephaloAngle: CephaloAngle): GeometricalAngle => {
      let vectors: CephaloLine[];
      if (cephaloAngle.components[0].type === 'point') {
        const [A, B, C] = cephaloAngle.components as CephaloPoint[];
        vectors = [line(A, B), line(B, C)];
      } else if (cephaloAngle.components[0].type === 'angle') {
        let A: CephaloPoint, B: CephaloPoint, C: CephaloPoint;
        const [angle1, angle2] = cephaloAngle.components;
        if (angle1.components[0].type === 'point') {
          [A, B, C] = uniqBy([...angle1.components, ...angle2.components], c => c.symbol) as CephaloPoint[];
        } else {
          [A, B, C] = uniqBy(
            [...angle1.components[1].components, ...angle2.components[1].components],
            c => c.symbol,
          ) as CephaloPoint[];
        }
        vectors = [line(A, B), line(B, C)];
      } else {
        vectors = cephaloAngle.components as CephaloLine[];
      }
      return {
        vectors: map(vectors, toVector),
      };
    };
    // @TODO: Handle scale factor
    return { toPoint, toAngle, toVector, scaleFactor: 1 / 3.2 };
  }
);

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

const tryMap = (s: CephaloLandmark, mapper: CephaloMapper)  => {
  let value: GeometricalObject | undefined = undefined;
  if (s.type === 'angle') {
    value = mapper.toAngle(s);
  } else if (s.type === 'line') {
    value = mapper.toVector(s);
  } else if (s.type === 'point') {
    value = mapper.toPoint(s);
  }
  return value;
};

export const isStepEligibleForAutomaticMappingSelector = createSelector(
  getManualStepStateSelector,
  (getManualStepState) => function isStepEligibleForAutomaticMapping(s: CephaloLandmark): boolean {
    if (isStepManual(s)) return false;
    return every(s.components, c => {
      if (c.type === 'point') {
        const state = getManualStepState(c);
        return state === 'done';
      }
      return isStepEligibleForAutomaticMapping(c);
    });
  },
);

export const automaticLandmarksSelector = createSelector(
  getPendingStepsSelector,
  cephaloMapperSelector,
  isStepEligibleForAutomaticMappingSelector,
  findEqualComponentsSelector,
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

export const getAllLandmarksSelector = createSelector(
  manualLandmarksSelector,
  automaticLandmarksSelector,
  (manual, automatic) => {
    return assign({ }, manual, automatic) as { [symbol: string]: EvaluatedValue };
  }
);

export const isStepEligibleForComputationSelector = createSelector(
  getAllLandmarksSelector,
  (allLandmarks) => (step: CephaloLandmark) => {
    return isStepComputable(step) && every(step.components, (c: CephaloLandmark) => allLandmarks[c.symbol] !== undefined);
  }
)

export const getComputedValues = createSelector(
  activeAnalysisStepsSelector,
  isStepEligibleForComputationSelector,
  cephaloMapperSelector,
  (steps, isEligible, mapper) => {
    const result: { [symbol: string]: number } = { };
    for (const step of steps) {
      if (isEligible(step)) {
        const value = compute(step, mapper);
        if (value !== undefined) {
          result[step.symbol] = value;
        } else {
          console.warn(
            'Step %s was eligible for automatic computation but a value could not be computed',
            step.symbol
          );
        }
      }
    }
    return result;
  },
)

export const getLandmarkValueSelector = createSelector(
  getComputedValues,
  (computedValues) => (step: Step | CephaloLandmark) => computedValues[step.symbol] || undefined,
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
      } else if (isLowerIncisorInclination(result.type)) {
        name = 'Lower Insicor Inclination';
      } else if (isUpperIncisorInclination(result.type)) {
        name = 'Upper Insicor Inclination';
      } else if (isSkeletalBite(result.type)) {
        name = 'Skeletal Bite';
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
  getComputedValues,
  activeAnalysisSelector,
  (allLandmarks, computed, activeAnalysis) => {
    if (!activeAnalysis) return false;
    return every(activeAnalysis.components, step => {
      return has(allLandmarks, step.landmark.symbol) || has(computed, step.landmark.symbol);
    });
  },
);

export const getAnalysisResultsSelector = createSelector(
  activeAnalysisSelector,
  isAnalysisCompleteSelector,
  getAllLandmarksSelector,
  getComputedValues,
  getViewableResultSelector,
  (analysis, isComplete, landmarks, values, getViewable): ViewableAnalysisResult[] => {
    if (analysis !== null && isComplete) {
      return map(analysis.interpret(assign({ }, landmarks, values)), getViewable);
    }
    return [];
  }
);

export const getAnyStepStateSelector = createSelector(
  getAllLandmarksSelector,
  getManualStepStateSelector,
  getComputedValues,
  (allLandmarks, getManualStepState, computed) => (step: CephaloLandmark): StepState => {
    if (allLandmarks[step.symbol] !== undefined) {
      return 'done';
    } else if (computed[step.symbol] !== undefined) {
      return 'done';
    } else {
      return getManualStepState(step);
    }
  }
);

import {
  loadImageFile,
  addManualLandmark,
} from '../../actions/workspace';

export const onCanvasClickedSelector = createSelector(
  nextManualLandmarkSelector,
  expectedLandmark => (dispatch: Function) => {
    return (e => {
      if (expectedLandmark) {
        __DEBUG__ && console.info('Expected next manual landmark:', expectedLandmark.symbol);
        dispatch(
          addManualLandmark(expectedLandmark.symbol, { x: e.X, y: e.Y })
        );
      } else {
        __DEBUG__ && console.warn('Could not find expected manual landmark');
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
