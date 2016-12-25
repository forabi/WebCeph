import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analyses, {
  getMappedValue,
  getAllGeoObjects,
  findStepBySymbol,
} from './analyses';
import treatment from './treatment';
import superimposition from './superimposition';
import image, { hasImage, getActiveManualLandmarks, getActiveImageId } from './image';
import { getSuperimposedImages } from './superimposition';
import { getWorkspaceMode } from './mode';
import workers from './workers';
import fileImport from './import';
import fileExport, { getExportError, hasExportError } from './export';

import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';

export default {
  ...analyses,
  ...image,
  ...canvas,
  ...workers,
  ...fileExport,
  ...fileImport,
  ...treatment,
  ...superimposition,
};

export const canEdit = hasImage;

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  findStepBySymbol,
  getAllGeoObjects,
  getMappedValue,
  (symbol, findStep, all, getMapped) => {
    if (symbol === null) {
      return { };
    }
    const unhighlighted = mapValues(all, () => false);
    const step = findStep(symbol);
    if (step !== null) {
      const highlighted = mapValues(getMapped(step), () => true);
      return { ...unhighlighted, ...highlighted };
    }
    return unhighlighted;
  },
);

export const getLandmarksToDisplay = getAllGeoObjects;

export const isHighlightMode = createSelector(
  getHighlightedLandmarks,
  (highlightedLandmarks) => !isEmpty(highlightedLandmarks),
);

export const isManualObject = createSelector(
  getActiveManualLandmarks,
  (manual) => (symbol: string) => manual[symbol] !== undefined,
);

export const isHighlightedObject = createSelector(
  getHighlightedLandmarks,
  (highlighted) => (symbol: string) => highlighted[symbol] === true,
);

export const getSortedLandmarksToDisplay = createSelector(
  isManualObject,
  isHighlightedObject,
  getLandmarksToDisplay,
  (isManual, isHighlighted, landmarksToDisplay) => {
    return sortBy(
      map(
        landmarksToDisplay,
        (value: GeoObject, symbol: string) => ({ symbol, value }),
      ),
      ({ symbol }) => (
        isManual(symbol) || isHighlighted(symbol)
      ),
    );
  },
);

export const hasUnsavedWork = createSelector(
  getActiveManualLandmarks,
  ({ present, past }) => !isEmpty(present) || !isEmpty(past),
);

export const canUndo = hasUnsavedWork;
export const canRedo = createSelector(
  getActiveManualLandmarks,
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

export const getWorkspaceImageIds = createSelector(
  getWorkspaceMode,
  getActiveImageId,
  getSuperimposedImages,
  (mode, activeId, superimposed) => {
    if (mode === 'tracing') {
      return activeId !== null ? [activeId] : [];
    }
    return superimposed;
  },
);

export const doesWorkspaceHaveImages = createSelector(
  getWorkspaceImageIds,
  (ids) => !isEmpty(ids),
);
