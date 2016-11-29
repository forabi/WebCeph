import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analysis, { getGeometricalRepresentationBySymbol, getManualLandmarks } from './analysis';
import image, { hasImage } from './image';
import workers from './workers';
import fileExport, { getExportError, hasExportError } from './export';

import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';

export default assign(
  { },
  image,
  canvas,
  workers,
  analysis,
  fileExport,
);

export const canEdit = hasImage;

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  getGeometricalRepresentationBySymbol,
  (step, getGeoRepresentation): { [symbol: string]: GeometricalObject | undefined } | { } => {
    if (step === null) {
      return { };
    }
    return getGeoRepresentation(step);
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
