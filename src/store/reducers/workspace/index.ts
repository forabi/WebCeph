import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analyses, {
  getMappedValue,
  getAllGeoObjects,
  findStepBySymbol,
} from './analyses';
import treatment from './treatment';
import image, { hasImage, getManualLandmarks } from './image';
import settings, { getSuperimposedImages, getWorkspaceMode, getTracingImageId } from './settings';
import workers from './workers';
import fileImport from './import';
import fileExport, { getExportError, hasExportError } from './export';
import order from './order';
import activeId, { getActiveWorkspaceId } from './activeId';

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
  ...settings,
  ...order,
  ...activeId,
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
  getManualLandmarks,
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

// export const hasUnsavedWork = createSelector(
//   getActiveManualLandmarks,
//   ({ present, past }) => !isEmpty(present) || !isEmpty(past),
// );

// export const canUndo = hasUnsavedWork;
// export const canRedo = createSelector(
//   getActiveManualLandmarks,
//   ({ future }) => !isEmpty(future),
// );

export const workspaceHasError = createSelector(
  hasExportError,
  (exportError) => exportError,
);

export const getWorkspaceErrorMessage = createSelector(
  getExportError,
  (error) => error !== null ? error.message : null,
);

export const getActiveTracingImageId = createSelector(
  getTracingImageId,
  getActiveWorkspaceId,
  (getImageId, workspaceId) => getImageId(workspaceId!),
);

const EMPTY_ARRAY: string[] = [];

export const getWorkspaceImageIds = createSelector(
  getWorkspaceMode,
  getActiveTracingImageId,
  getSuperimposedImages,
  (getMode, activeId, getSuperimposedImages) => (workspaceId: string): string[] => {
    if (getMode(workspaceId) === 'tracing') {
      return activeId !== null ? [activeId] : EMPTY_ARRAY;
    }
    return getSuperimposedImages(workspaceId);
  },
);

export const getActiveWorkspaceMode = createSelector(
  getWorkspaceMode,
  getActiveWorkspaceId,
  (getMode, workspaceId) => getMode(workspaceId!),
);

export const getActiveWorkspaceImageIds = createSelector(
  getWorkspaceImageIds,
  getActiveWorkspaceId,
  (getImages, workspaceId) => getImages(workspaceId!),
);
