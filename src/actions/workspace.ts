import { Action } from '../utils/constants';
import { createAction } from 'redux-actions';

export const addPoint = createAction(Action.ADD_POINT);

export const loadImageFile = createAction(Action.LOAD_IMAGE_REQUESTED);
export const flipImageX = createAction(Action.FLIP_IMAGE_X);
export const setBrightness = createAction(Action.SET_IMAGE_BRIGHTNESS);
export const invertImage = createAction(Action.INVERT_IMAGE);
