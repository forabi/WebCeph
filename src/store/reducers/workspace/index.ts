import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analysis, { getLandmarkWithAllNestedLandmarks, getManualLandmarks } from './analysis';
import image, { hasImage } from './image';
import workers from './workers';

import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';

export default assign(
  { },
  image,
  canvas,
  workers,
  analysis,
);

export const canEdit = hasImage;

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
  getManualLandmarks,
  ({ present, past }) => !isEmpty(present) || !isEmpty(past),
);

export const canUndo = hasUnsavedWork;
export const canRedo = createSelector(
  getManualLandmarks,
  ({ future }) => !isEmpty(future),
);
