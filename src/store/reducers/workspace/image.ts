import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { defaultTreatmentStageId } from 'utils/config';

import { createSelector } from 'reselect';

import assign from 'lodash/assign';
import some from 'lodash/some';

type Height = StoreEntries.workspace.image.height;
type Width = StoreEntries.workspace.image.width;
type Data = StoreEntries.workspace.image.data;
type LoadError = StoreEntries.workspace.image.loadError;
type FlipX = StoreEntries.workspace.image.flipX;
type FlipY = StoreEntries.workspace.image.flipY;
type Brigthness = StoreEntries.workspace.image.brightness;
type Contrast = StoreEntries.workspace.image.contrast;
type Invert = StoreEntries.workspace.image.invert;
type IsLoading = StoreEntries.workspace.image.isLoading;

const KEY_IMAGE_HEIGHT = StoreKeys.imageHeight;
const KEY_IMAGE_WIDTH = StoreKeys.imageWidth;
const KEY_IMAGE_DATA = StoreKeys.imageData;
const KEY_IMAGE_INVERT = StoreKeys.imageInvert;
const KEY_IMAGE_CONTRAST = StoreKeys.imageContrast;
const KEY_IMAGE_BRIGHTNESS = StoreKeys.imageBrightness;
const KEY_IMAGE_FLIP_X = StoreKeys.imageFlipX;
const KEY_IMAGE_FLIP_Y = StoreKeys.imageFlipY;
const KEY_IMAGE_IS_LOADING = StoreKeys.imageIsLoading;
const KEY_IMAGE_LOAD_ERROR = StoreKeys.imageLoadError;

const defaultStageId: StageId = defaultTreatmentStageId;

const defaultData: Data = {
  [defaultStageId]: null,
};

const defaultLoadError: LoadError = {
  [defaultStageId]: null,
};

const defaultIsLoading: IsLoading = {
  [defaultStageId]: false,
};

// @TODO: normalize to [-1, 1] instead of 0-100
const defaultBrightness: Brigthness = {
  [defaultStageId]: 50,
};

const defaultContrast: Contrast = {
  [defaultStageId]: 1,
};

const defaultInvert: Invert = {
  [defaultStageId]: false,
};

const defaultWidth: Width = {
  [defaultStageId]: null,
};

const defaultHeight: Height = {
  [defaultStageId]: null,
};

const defaultFlipX: FlipX = {
  [defaultStageId]: false,
};

const defaultFlipY: FlipY = {
  [defaultStageId]: false,
};

const setHeight = handleActions<
  Height,
  Payloads.imageLoadSucceeded | Payloads.imageLoadFailed | Payloads.imageLoadRequested
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (state, action) => {
      const payload = action.payload as Payloads.imageLoadSucceeded | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return payload.height;
    },
    [Event.LOAD_IMAGE_REQUESTED]: (_, __) => {
      return null;
    },
  },
  defaultHeight,
);

const setWidth = handleActions<
  Height,
  Payloads.imageLoadSucceeded | Payloads.imageLoadFailed | Payloads.imageLoadRequested
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (state, action) => {
      const payload = action.payload as Payloads.imageLoadSucceeded | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return payload.width;
    },
    [Event.LOAD_IMAGE_REQUESTED]: (_, __) => {
      return null;
    },
  },
  defaultWidth,
);

const setData = handleActions<
  Data,
  Payloads.imageLoadSucceeded | Payloads.imageLoadFailed | Payloads.imageLoadRequested
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (state, action) => {
      const payload = action.payload as Payloads.imageLoadSucceeded | undefined;
      if (payload === undefined) {
        printUnexpectedPayloadWarning(action.type, state);
        return state;
      }
      return payload.data;
    },
    [Event.LOAD_IMAGE_REQUESTED]: (_, __) => {
      return null;
    },
  },
  defaultData,
);

const setLoadError = handleActions<LoadError, Payloads.imageLoadFailed>({
  [Event.IGNORE_WORKSPACE_ERROR_REQUESTED]: (_, __) => null,
  [Event.LOAD_IMAGE_FAILED]: (state, { type, payload: error }) => {
    if (error === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return error;
  },
  [Event.LOAD_IMAGE_REQUESTED]: () => null,
  [Event.RESET_WORKSPACE_REQUESTED]: () => null,
}, defaultLoadError);

const setLoadStatus = handleActions<
  IsLoading,
  Payloads.imageLoadRequested | Payloads.imageLoadFailed | Payloads.imageLoadSucceeded
>({
  [Event.LOAD_IMAGE_REQUESTED]: () => true,
  [Event.LOAD_IMAGE_FAILED]: () => false,
  [Event.LOAD_IMAGE_SUCCEEDED]: () => false,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, defaultIsLoading);

const flipX = handleActions<FlipX, Payloads.flipImageX>({
  [Event.FLIP_IMAGE_X_REQUESTED]: (state: boolean) => !state,
  [Event.LOAD_IMAGE_REQUESTED]: () => false,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, defaultFlipX);

const flipY = handleActions<FlipY, Payloads.flipImageY>({
  [Event.FLIP_IMAGE_Y_REQUESTED]: (state: boolean) => !state,
  [Event.LOAD_IMAGE_REQUESTED]: () => false,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, defaultFlipY);

// @TODO: normalize to [-1, 1] instead of 0-100
const setBrightness = handleActions<Brigthness, Payloads.setBrightness>({
  [Event.SET_IMAGE_BRIGHTNESS_REQUESTED]: (state, { type, payload: value }) => {
    if (value === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return value;
  },
  [Event.LOAD_IMAGE_REQUESTED]: () => defaultBrightness,
  [Event.RESET_WORKSPACE_REQUESTED]: () => defaultBrightness,
}, defaultBrightness);

const setContrast = handleActions<Contrast, Payloads.setContrast>({
  [Event.SET_IMAGE_CONTRAST_REQUESTED]: (state, { type, payload: value }) => {
    if (value === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return value;
  },
  [Event.LOAD_IMAGE_REQUESTED]: () => defaultContrast,
  [Event.RESET_WORKSPACE_REQUESTED]: () => defaultContrast,
}, defaultContrast);

const setInvert = handleActions<Invert, Payloads.setInvert>({
  [Event.INVERT_IMAGE_REQUESTED]: (state) => !state,
  [Event.RESET_WORKSPACE_REQUESTED]: () => false,
}, defaultInvert);

export default {
  [KEY_IMAGE_HEIGHT]: setHeight,
  [KEY_IMAGE_WIDTH]: setWidth,
  [KEY_IMAGE_DATA]: setData,
  [KEY_IMAGE_INVERT]: setInvert,
  [KEY_IMAGE_CONTRAST]: setContrast,
  [KEY_IMAGE_BRIGHTNESS]: setBrightness,
  [KEY_IMAGE_FLIP_X]: flipX,
  [KEY_IMAGE_FLIP_Y]: flipY,
  [KEY_IMAGE_IS_LOADING]: setLoadStatus,
  [KEY_IMAGE_LOAD_ERROR]: setLoadError,
};

export const isAnyImageLoading = (state: GenericState): boolean => {
  return some(state[KEY_IMAGE_IS_LOADING], (v) => v === true);
};

export const getImageWidth = (state: GenericState) => (stageId: StageId): number | null => {
  return state[KEY_IMAGE_WIDTH][stageId];
};

export const getImageHeight = (state: GenericState) => (stageId: StageId): number | null => {
  return state[KEY_IMAGE_HEIGHT][stageId];
};

export const getAllImageData = (state: GenericState) => {
  return state[KEY_IMAGE_DATA];
};

export const getImageData = createSelector(
  getAllImageData,
  (allData) => (stageId: StageId): string => {
    return allData[stageId];
  },
);

export const hasAnyImage = createSelector(
  getAllImageData,
  (allData) => some(allData, (data) => data !== null),
);

export const getImageSize = createSelector(
  getImageWidth,
  getImageHeight,
  (getWidth, getHeight) => (stageId: StageId): { width: number | null, height: number | null } => ({
    width: getWidth(stageId),
    height: getHeight(stageId),
  }),
);

export const getImageBrightness =
  (state: GenericState) =>
    (stageId: StageId): number => state[KEY_IMAGE_BRIGHTNESS][stageId];

export const getImageContrast =
  (state: GenericState) =>
    (stageId: StageId): number => state[KEY_IMAGE_CONTRAST][stageId];

export const isImageFlippedX =
  (state: GenericState) =>
    (stageId: StageId): boolean => state[KEY_IMAGE_FLIP_X][stageId];

export const isImageFlippedY =
  (state: GenericState) =>
    (stageId: StageId): boolean => state[KEY_IMAGE_FLIP_Y][stageId];

export const isImageInverted =
  (state: GenericState) =>
    (stageId: StageId): boolean => state[KEY_IMAGE_INVERT][stageId];
