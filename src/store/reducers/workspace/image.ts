import { handleActions } from 'redux-actions';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

import { createSelector } from 'reselect';

import assign from 'lodash/assign';
import some from 'lodash/some';
import memoize from 'lodash/memoize';

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

export const getImage = (
  state: GenericState, { imageId }: { imageId: ImageId }
) => {
  return getAllImageData(state)[imageId];
};

export const getImageWidth = createSelector(
  getImage,
  (image) => image.width,
);

export const getImageHeight = createSelector(
  getImage,
  (image) => image.height,
);

export const getImageData = createSelector(
  getImage,
  (image) => image.data,
);

export const getImageSize = createSelector(
  getImageWidth,
  getImageHeight,
  (width, height) => ({
    width,
    height,
  }),
);

export const getImageBrightness = createSelector(
  getImage,
  (image) => image.brightness,
);

export const getImageContrast = createSelector(
  getImage,
  (image) => image.brightness,
);

export const isImageFlippedX = createSelector(
  getImage,
  (image) => image.flipX,
);

export const isImageFlippedY = createSelector(
  getImage,
  (image) => image.flipY,
);

export const isImageInverted = createSelector(
  getImage,
  (image) => image.invert,
);

export const getActiveImageQuery = memoize(
  (state: GenericState): SelectorQuery => {
    const imageId = getActiveImageId(state);
    if (__DEBUG__ && imageId === null) {
      console.warn('getActiveImageQuery was called, but no active image is selected.');
    }
    return {
      imageId,
    };
  },
);



