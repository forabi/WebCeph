import { handleAction, handleActions } from 'redux-actions';
import { wrapWithDefaultState } from '../../helpers';
import { Event, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';
import { createSelector } from 'reselect';

type Height = StoreEntries.workspace.image.height;
type Width = StoreEntries.workspace.image.width;
type Data = StoreEntries.workspace.image.data;

const KEY_IMAGE_HEIGHT = StoreKeys.imageHeight;
const KEY_IMAGE_WIDTH = StoreKeys.imageWidth;
const KEY_IMAGE_DATA = StoreKeys.imageData;
const defaultWidth: Height = null;
const defaultHeight: Width = null;
const defaultData: Data = null;

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
      return payload.height;
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

export default {
  [KEY_IMAGE_HEIGHT]: setHeight,
  [KEY_IMAGE_WIDTH]: setWidth,
  [KEY_IMAGE_DATA]: setData,
};


export const getImageWidth = (state: GenericState) => {
  return state[KEY_IMAGE_WIDTH] as Width;
};

export const getImageHeight = (state: GenericState) => {
  return state[KEY_IMAGE_HEIGHT] as Height;
};

export const getImageData = (state: GenericState) => {
  return state[KEY_IMAGE_DATA] as Data;
};

export const getImageSize = createSelector(
  getImageWidth,
  getImageHeight,
  (width, height) => ({ width, height }),
);
