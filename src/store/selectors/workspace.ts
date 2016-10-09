import { getStepsForAnalysis } from '../../analyses/helpers';
import { createSelector } from 'reselect';
import filter from 'lodash/filter';
import has from 'lodash/has';
import every from 'lodash/every';
import find from 'lodash/find';
import map from 'lodash/map';
import { mapResultToViewableResult } from '../../analyses/helpers';

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

export const getStepStateSelector = createSelector(
  stepsBeingEvaluatedSelector,
  manualLandmarksSelector,
  expectedNextLandmarkSelector,
  (stepsBeingEvaluated, setLandmarks, expectedLandmark) => (landmark: CephaloLandmark): StepState => {
    if (has(setLandmarks, landmark.symbol)) {
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
  (mappedLandmarks): CephaloMapper => {
    const toPoint = (cephaloPoint: CephaloPoint) => {
      return mappedLandmarks[cephaloPoint.symbol] as GeometricalPoint;
    };
    const toLine = (cephaloLine: CephaloLine) => {
      const A = toPoint(cephaloLine.components[0]);
      const B = toPoint(cephaloLine.components[1]);
      return {
        x1: A.x,
        y1: A.y,
        x2: B.x,
        y2: B.y,
      }
    };
    // @TODO: Handle scale factor
    return { toPoint, toLine, scaleFactor: 1 / 3.2 };
  }
)

export const mapLandmarkToGeometricalObject = createSelector(
  cephaloMapperSelector,
  cephaloMapper => (landmark: CephaloLandmark) => {
    const { toLine, toPoint } = cephaloMapper;
    if (landmark.type === 'line') {
      return toLine(landmark);
    } else if (landmark.type === 'point') {
      return toPoint(landmark);
    }
    return undefined;
  },
);

export const getLandmarkValueSelector = createSelector(
  manualLandmarksSelector,
  (manualLandmarks) => (step: Step | CephaloLandmark) => manualLandmarks[step.symbol],
);

// @TODO
// export const getComputedValueSelector = createSelector(
//   manualLandmarksSelector,
//   (manualLandmarks) => (step: Step | CephaloLandmark) => {
//     evaluate()
//   }
// )

import {
  mapSeverityToString,
  mapTypeToIndication,
  isSkeletalPattern,
  isSkeletalProfile,
  isMaxilla, isMandible
} from '../../analyses/helpers';
import keyBy from 'lodash/keyBy';
import compact from 'lodash/compact';

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

export const isAnalysisCompleteSelector = createSelector(
  manualLandmarksSelector,
  activeAnalysisSelector,
  (mappedLandmarks, activeAnalysis) => {
    if (!activeAnalysis) return false;
    return every(activeAnalysis.components, step => has(mappedLandmarks, step.landmark.symbol));
  },
);

export const getAnalysisResultsSelector = createSelector(
  activeAnalysisSelector,
  isAnalysisCompleteSelector,
  manualLandmarksSelector,
  getViewableResultSelector,
  (analysis, isComplete, values, getViewable): ViewableAnalysisResult[] => {
    if (analysis !== null && isComplete) {
      return map(analysis.interpret(values), getViewable);
    }
    return [];
  }
)

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
