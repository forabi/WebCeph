import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analysis, { getLandmarkWithAllNestedLandmarks, getManualLandmarks } from './analysis';
import image, { hasImage } from './image';
import workers from './workers';
import fileExport, { getExportError, hasExportError } from './export';

import isEmpty from 'lodash/isEmpty';

export default {
  ...image,
  ...canvas,
  ...workers,
  ...analysis,
  ...fileExport,
};

export const canEdit = hasImage;

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  getLandmarkWithAllNestedLandmarks,
  (step, getWithNested): { [symbol: string]: GeometricalObject } => {
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

export const workspaceHasError = createSelector(
  (hasExportError),
  (exportError) => exportError,
);

export const getWorkspaceErrorMessage = createSelector(
  (getExportError),
  (error) => error !== null ? error.message : null,
);
