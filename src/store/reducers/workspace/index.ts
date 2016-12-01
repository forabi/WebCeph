import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analysis, { getComponentWithAllPossibleNestedComponents, getAllLandmarks, getManualLandmarks } from './analysis';
import image, { hasImage } from './image';
import workers from './workers';
import fileExport, { getExportError, hasExportError } from './export';

import assign from 'lodash/assign';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import mapValues from 'lodash/mapValues';

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
  getAllLandmarks,
  getComponentWithAllPossibleNestedComponents,
  (step, all, getNested): { [symbol: string]: boolean } => {
    if (step === null) {
      return { };
    }
    const unhighlighted = mapValues(all, () => false);
    const highlighted = mapValues(keyBy(getNested(step), l => l.symbol), () => true);
    return assign({ }, unhighlighted, highlighted);
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
