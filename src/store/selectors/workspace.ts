import { getStepsForAnalysis } from '../../analyses/helpers';
import { createSelector } from 'reselect';
import filter from 'lodash/filter';
import has from 'lodash/has';
import intersection from 'lodash/intersection';
import map from 'lodash/map';
import includes from 'lodash/includes';
import find from 'lodash/find';
import mapValues from 'lodash/mapValues';

const setLandmarksSelector = (state: StoreState) => state['cephalo.workspace.landmarks'];

const activeAnalysisSelector = (state: StoreState) => state['cephalo.workspace.analysis.activeAnalysis'];

const imageDataSelector = (state: StoreState) => state['cephalo.workspace.image.data'];

export const stepsBeingEvaluatedSelector = (state: StoreState) => state['cephalo.workspace.analysis.stepsBeingEvaluated'];

export const getStepStateSelector = createSelector(
  stepsBeingEvaluatedSelector,
  setLandmarksSelector,
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
  setLandmarksSelector,
  (steps, landmarks) => filter(steps, s => has(landmarks, s.symbol)),
);

export const isAnalysisCompleteSelector = createSelector(
  setLandmarksSelector,
  activeAnalysisSelector,
  (setLandmarks, activeAnalysis) => {
    if (!activeAnalysis) return false;
    return intersection(
      map(activeAnalysis, x => x.landmark.symbol),
      map(setLandmarks, x => x.symbol),
    ).length > 0;
  },
);

export const expectedNextLandmarkSelector = createSelector(
  activeAnalysisStepsSelector,
  setLandmarksSelector,
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
          addLandmark(expectedLandmark, e.e.offsetX, e.e.offsetY)
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

export const mappedLandmarksSelector = createSelector(
  setLandmarksSelector,
  landmarks => mapValues(landmarks, x => x.mappedTo),
);