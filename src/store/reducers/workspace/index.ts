import { createSelector } from 'reselect';
import canvas, { getHighlightedStep } from './canvas';
import analysis, {
  getGeometricalRepresentationBySymbol,
  getAllLandmarks,
  getManualLandmarks,
} from './analysis';
import image, { hasImage } from './image';
import workers from './workers';
import fileExport, { getExportError, hasExportError } from './export';

import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';

export default {
  ...image,
  ...canvas,
  ...workers,
  ...analysis,
  ...fileExport,
};

export const canEdit = hasImage;


export const getLandmarksToDisplay = createSelector(
  getHighlightedStep,
  getGeometricalRepresentationBySymbol,
  getAllLandmarks,
  (highlighted, getGeo, all) => {
    if (highlighted !== null) {
      return assign({ }, getGeo(highlighted), all);
    }
    return all;
  }
);

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  getAllLandmarks,
  getGeometricalRepresentationBySymbol,
  (step, all, getGeo): { [symbol: string]: boolean } => {
    if (step === null) {
      return { };
    }
    const unhighlighted = mapValues(all, () => false);
    const highlighted = mapValues(getGeo(step), () => true);
    return { ...unhighlighted, ...highlighted };
  },
);

export const isHighlightMode = createSelector(
  getHighlightedLandmarks,
  (highlightedLandmarks) => !isEmpty(highlightedLandmarks),
);

export const getSortedLandmarksToDisplay = createSelector(
  getManualLandmarks,
  getHighlightedLandmarks,
  getLandmarksToDisplay,
  ({ present: manualLandmarks }, highlightedLandmarks, landmarksToDisplay) => {
    return sortBy(
      map(
        landmarksToDisplay,
        (value: GeometricalObject, symbol: string) => ({
          symbol,
          label: symbol,
          value,
        }),
      ),
      ({ symbol }) => (
        manualLandmarks[symbol] !== undefined ||
        highlightedLandmarks[symbol] === true
      ),
    );
  }
)

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
