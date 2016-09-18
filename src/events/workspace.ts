import { Event } from '../utils/constants';
import { createAction } from 'redux-actions';

export const addPoint = createAction(Event.ADD_POINT_REQUESTED);

export const loadImageFile = createAction(Event.LOAD_IMAGE_REQUESTED);
export const flipImageX = createAction(Event.FLIP_IMAGE_X_REQUESTED);
export const setBrightness = createAction(Event.SET_IMAGE_BRIGHTNESS_REQUESTED);
export const invertImage = createAction(Event.INVERT_IMAGE_REQUESTED);
export const resetWorkspace = createAction(Event.RESET_WORKSPACE_REQUESTED);

/**
 * Ignores the result of automatic detection of whether the image is a cephalometric radiograph
 */
export const ignoreLikelyNotCephalo = createAction(
  Event.SET_IS_CEPHALO_REQUESTED,
  () => ({ isCephalo: true }),
);