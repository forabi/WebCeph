import { getStepsForAnalysis } from '../../analyses/helpers';
import { createSelector } from 'reselect';
import filter from 'lodash/filter';
import has from 'lodash/has';
import every from 'lodash/every';
import includes from 'lodash/includes';
import find from 'lodash/find';

export const mappedLandmarksSelector = (state: StoreState) => state['cephalo.workspace.landmarks'];

const activeAnalysisSelector = (state: StoreState) => state['cephalo.workspace.analysis.activeAnalysis'];

const imageDataSelector = (state: StoreState) => state['cephalo.workspace.image.data'];

export const stepsBeingEvaluatedSelector = (state: StoreState) => state['cephalo.workspace.analysis.stepsBeingEvaluated'];

export const getStepStateSelector = createSelector(
  stepsBeingEvaluatedSelector,
  mappedLandmarksSelector,
  (stepsBeingEvaluated, setLandmarks) => (landmark: CephaloLandmark): stepState => {
    if (includes(stepsBeingEvaluated, landmark.symbol)) {
      return 'evaluating';
    } else if (has(setLandmarks, landmark.symbol)) {
      return 'done';
    } else {
      return 'pending';
    }
  },
);

export const cephaloMapperSelector = createSelector(
  mappedLandmarksSelector,
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
    return { toPoint, toLine, scaleFactor: 1 };
  }
)

export const mapLandmarkToGeometricalObject = createSelector(
  cephaloMapperSelector,
  cephaloMapper => (l: CephaloLandmark) => {
    const { toLine, toPoint } = cephaloMapper;
    if (l.type === 'line') {
      return toLine(l as CephaloLine);
    } else if (l.type === 'point') {
      return toPoint(l as CephaloPoint);
    }
    return undefined;
  },
);

export const getLandmarkValueSelector = createSelector(
  mappedLandmarksSelector,
  (mappedLandmarksSelector) => (step: Step | CephaloLandmark) => mappedLandmarksSelector[step.symbol],
)

export const isAnalysisActiveSelector = createSelector(
  activeAnalysisSelector,
  imageDataSelector,
  (analysis, data) => (
      analysis !== null && data !== null
  ),
)

export const activeAnalysisStepsSelector = createSelector(
  activeAnalysisSelector,
  analysis => {
    if (analysis !== null) {
      return getStepsForAnalysis(analysis);
    }
    return [];
  }
);

export const completedStepsSelector = createSelector(
  activeAnalysisStepsSelector,
  mappedLandmarksSelector,
  (steps, setLandmarks) => filter(steps, s => has(setLandmarks, s.symbol)),
);

export const isAnalysisCompleteSelector = createSelector(
  mappedLandmarksSelector,
  activeAnalysisSelector,
  (setLandmarks, activeAnalysis) => {
    if (!activeAnalysis) return false;
    return every(activeAnalysis, step => has(setLandmarks, step.landmark.symbol));
  },
);

export const expectedNextLandmarkSelector = createSelector(
  activeAnalysisStepsSelector,
  mappedLandmarksSelector,
  (steps, setLandmarks) => (find(
    steps,
    x => x.type === 'point' && !has(setLandmarks, x.symbol),
  ) || null) as CephaloLandmark | null,
);

import {
  loadImageFile,
  addLandmark,
  tryAutomaticSteps,
} from '../../actions/workspace';

export const onCanvasClickedSelector = createSelector(
  expectedNextLandmarkSelector,
  expectedLandmark => (dispatch: Function) => {
    return (e => {
      if (expectedLandmark) {
        dispatch(
          addLandmark(expectedLandmark.symbol, { x: e.e.layerX, y: e.e.layerY })
        );
        dispatch(tryAutomaticSteps());
      }
    }) as (e: fabric.IEvent & { e: MouseEvent }) => void;
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
