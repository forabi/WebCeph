import { createSelector } from 'reselect';
import assign from 'lodash/assign';
import canvas, { getHighlightedStep } from './canvas';
import analysis, { getLandmarkWithAllNestedLandmarks } from './analysis';
import image, { hasImage } from './image';
import workers from './workers';

export default assign(
  { }, 
  image,
  canvas,
  workers,
  analysis,
);

export const canUndo = ({ past }: EnhancedState<GenericState>) => past.length > 0;
export const canRedo = ({ future }: EnhancedState<GenericState>) => future.length > 0;
export const canEdit = hasImage;

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  getLandmarkWithAllNestedLandmarks,
  (step, getWithNested): GeometricalObject[] => {
    if (step === null) {
      return [];
    }
    return getWithNested(step);
  },
);
