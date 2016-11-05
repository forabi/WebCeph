import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analysis, { getLandmarkWithAllNestedLandmarks, getManualLandmarksHistory } from './analysis';
import image, { hasAnyImage } from './image';
import workers from './workers';
import workspaceMode, { getWorkspaceMode } from './mode';

import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';

export default assign(
  { },
  workspaceMode,
  image,
  canvas,
  workers,
  analysis,
);

export {
  getWorkspaceMode,
}

export const canEdit = hasAnyImage;

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  getLandmarkWithAllNestedLandmarks,
  (step, getWithNested): { [symbol: string]: GeometricalObject | undefined } | { } => {
    if (step === null) {
      return { };
    }
    return getWithNested(step);
  },
);

export const hasUnsavedWork = createSelector(
  getManualLandmarksHistory,
  ({ present, past }) => !isEmpty(present) || !isEmpty(past),
);

export const canUndo = hasUnsavedWork;
export const canRedo = createSelector(
  getManualLandmarksHistory,
  ({ future }) => !isEmpty(future),
);
