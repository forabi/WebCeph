import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

import { createSelector } from 'reselect';

import assign from 'lodash/assign';
import some from 'lodash/some';

type Images = StoreEntries.workspace.images.data;
type ActiveImageId = StoreEntries.workspace.images.activeId;

const defaultImages: Images = { };
const defaultActiveImageId: ActiveImageId = null;

const KEY_IMAGES = StoreKeys.images;
const KEY_ACTIVE_IMAGE_ID = StoreKeys.activeImageId;

const imagesReducer = handleActions<
  Images,
  (
    Payloads.imageLoadRequested | Payloads.imageLoadFailed | Payloads.imageLoadSucceeded |
    Payloads.flipImageX | Payloads.flipImageY |
    Payloads.setBrightness | Payloads.setContrast | Payloads.setInvert |
    Payloads.setScaleFactor | Payloads.unsetScaleFactor
  )
>(
  {
    [Event.LOAD_IMAGE_SUCCEEDED]: (
      state: Images,
      { type, payload }: Action<Payloads.imageLoadSucceeded>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId, data, height, width } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              data,
              height,
              width,
              isLoading: false,
            },
          ),
        },
      );
    },
    [Event.LOAD_IMAGE_REQUESTED]: (
      state: Images,
      { type, payload }: Action<Payloads.imageLoadRequested>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              isLoading: true,
              loadError: null,
            },
          ),
        },
      );
    },
    [Event.LOAD_IMAGE_FAILED]: (
      state: Images,
      { type, payload }: Action<Payloads.imageLoadFailed>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId, message } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              loadError: message,
              isLoading: false,
            }
          ),
        },
      );
    },
    [Event.FLIP_IMAGE_X_REQUESTED]: (
      state: Images,
      { type, payload }: Action<Payloads.flipImageX>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              flipX: !state[imageId].flipX,
            }
          ),
        },
      );
    },
    [Event.FLIP_IMAGE_Y_REQUESTED]: (
      state: Images,
      { type, payload }: Action<Payloads.flipImageY>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              flipY: !state[imageId].flipY,
            }
          ),
        },
      );
    },
    [Event.INVERT_IMAGE_REQUESTED]: (
      state: Images,
      { type, payload }: Action<Payloads.invertColors>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              invert: !state[imageId].invert,
            }
          ),
        },
      );
    },
    [Event.SET_IMAGE_BRIGHTNESS_REQUESTED]: (
      state: Images,
      { type, payload }: Action<Payloads.setBrightness>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId, value } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              brightness: value,
            }
          ),
        },
      );
    },
    [Event.SET_IMAGE_CONTRAST_REQUESTED]: (
      state: Images,
      { type, payload }: Action<Payloads.setContrast>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      const { imageId, value } = payload;
      return assign(
        { },
        state,
        {
          [imageId]: assign(
            { },
            state[imageId],
            {
              contrast: value,
            }
          ),
        },
      );
    },
  },
  defaultImages,
);

const activeImageIdReducer = handleActions<
  ActiveImageId,
  Payloads.setActiveImageId | Payloads.resetWorkspace
>(
  {
    [Event.SET_ACTIVE_IMAGE_ID]: (
      state: ActiveImageId,
      { type, payload }: Action<Payloads.setActiveImageId>
    ) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload;
    },
    [Event.RESET_WORKSPACE_REQUESTED]: (
      state: ActiveImageId,
      { type, payload }: Action<Payloads.resetWorkspace>
    ) => {
      if (payload !== undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return null;
    },
  },
  defaultActiveImageId,
);

export const getActiveImageId = (state: GenericState): ImageId => state[KEY_ACTIVE_IMAGE_ID];

export default {
  [KEY_IMAGES]: imagesReducer,
  [KEY_ACTIVE_IMAGE_ID]: activeImageIdReducer,
};

export const getAllImageData = (state: GenericState): Images => {
  return state[KEY_IMAGES];
};

export const isAnyImageLoading = createSelector(
  getAllImageData,
  (images): boolean => {
    return some(
      images,
      (image) => image.isLoading === true,
    );
  },
);

export const hasAnyImage = createSelector(
  getAllImageData,
  (images): boolean => {
    return some(
      images,
      (image) => image.data !== null,
    );
  },
);

export const getImageById = createSelector(
  getAllImageData,
  (images) => (imageId: ImageId) => {
    return images[imageId];
  },
);

export const getImageWidthById = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).width;
  },
);

export const getImageHeightById = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).height;
  },
);

export const getImageDataById = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).data;
  },
);

export const getImageSizeById = createSelector(
  getImageWidthById,
  getImageHeightById,
  (getWidth, getHeight) => (imageId: ImageId): { height: number | null, width: number | null } => ({
    width: getWidth(imageId),
    height: getHeight(imageId),
  }),
);

export const getImageBrightnessById = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).brightness;
  },
);

export const getImageContrastById = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).contrast;
  },
);

export const isImageFlippedX = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).flipX;
  },
);

export const isImageFlippedY = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).flipY;
  },
);

export const isImageInverted = createSelector(
  getImageById,
  (getImage) => (imageId: ImageId) => {
    return getImage(imageId).invert;
  },
);

export const getActiveImageData = createSelector(
  getImageDataById,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);

export const getActiveImageSize = createSelector(
  getImageSizeById,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);

export const getActiveImageBrightness = createSelector(
  getImageBrightnessById,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);

export const getActiveImageContrast = createSelector(
  getImageContrastById,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);

export const isActiveImageFlippedX = createSelector(
  isImageFlippedX,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);

export const isActiveImageFlippedY = createSelector(
  isImageFlippedY,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);

export const isActiveImageInverted = createSelector(
  isImageInverted,
  getActiveImageId,
  (fn, stageId) => fn(stageId),
);
