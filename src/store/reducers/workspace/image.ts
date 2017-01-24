import { handleActions } from 'utils/store';
import some from 'lodash/some';
import omit from 'lodash/omit';

import { createSelector } from 'reselect';

const KEY_IMAGES: StoreKey = 'workspace.images.props';
const KEY_IMAGES_LOAD_STATUS: StoreKey = 'workspace.images.status';
const KEY_TRACING: StoreKey = 'workspace.images.tracing';
const KEY_ACTIVE_IMAGE_ID: StoreKey = 'workspace.images.activeImageId';

const imagesReducer = handleActions<typeof KEY_IMAGES>(
  {
    SET_IMAGE_PROPS: (state, { payload }) => {
      return {
        ...state,
        [payload.id]: {
          ...state[payload.id],
          ...payload,
        },
      };
    },
    LOAD_IMAGE_SUCCEEDED: (state, { payload }) => {
      return {
        ...state,
        [payload.id]: {
          name: null,
          type: 'ceph_lateral',
          scaleFactor: null,
          flipX: false,
          flipY: false,
          brightness: 0.5,
          contrast: 0.5,
          invertColors: false,
          analysis: {
            activeId: null,
          },
          ...payload,
        },
      };
    },
    CLOSE_IMAGE_REQUESTED: (state, { payload: { id } }) => {
      return omit(state, id) as typeof state;
    },
    SET_SCALE_FACTOR_REQUESTED: (state, { payload: { imageId, value } }) => {
      return {
        ...state,
        [imageId]: {
          ...state[imageId],
          scaleFactor: value,
        },
      };
    },
    UNSET_SCALE_FACTOR_REQUESTED: (state, { payload: { imageId } }) => {
      return {
        ...state,
        [imageId]: {
          ...state[imageId],
          scaleFactor: null,
        },
      };
    },
  },
  {},
);

const loadStatusReducer = handleActions<typeof KEY_IMAGES_LOAD_STATUS>({
  LOAD_IMAGE_FAILED: (state, { payload: { id, error } }) => {
    return {
      ...state,
      [id]: {
        isLoading: false,
        error,
      },
    };
  },
  LOAD_IMAGE_REQUESTED: (state, { payload: { id } }) => {
    return {
      ...state,
      [id]: {
        isLoading: true,
        error: null,
      },
    };
  },
  LOAD_IMAGE_SUCCEEDED: (state, { payload: { id } }) => {
    return {
      ...state,
      [id]: {
        isLoading: false,
        error: null,
      },
    };
  },
  CLOSE_IMAGE_REQUESTED: (state, { payload: id }) => {
    return omit(state, id) as typeof state;
  },
}, {});

const tracingReducer = handleActions<typeof KEY_TRACING>({
  SET_IMAGE_PROPS: (state, { payload: { id, tracing } }) => {
    if (tracing) {
      return {
        ...state,
        [id]: {
          ...state[id],
          ...tracing,
        },
      };
    }
    return state;
  },
  SET_TRACING_MODE_REQUESTED: (state, { payload: { imageId, mode } }) => {
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        mode,
      },
    };
  },
  ADD_MANUAL_LANDMARK_REQUESTED: (state, { payload }) => {
    const { imageId, symbol, value } = payload;
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        manualLandmarks: {
          ...state[imageId].manualLandmarks,
          [symbol]: value,
        },
      },
    };
  },
  REMOVE_MANUAL_LANDMARK_REQUESTED: (state, { payload }) => {
    const { imageId, symbol } = payload;
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        manualLandmarks: {
          ...omit(state[imageId].manualLandmarks, symbol),
        },
      },
    };
  },
  SKIP_MANUAL_STEP_REQUESTED: (state, { payload: { imageId, step } }) => {
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        skippedSteps: {
          ...state[imageId].skippedSteps,
          [step]: true,
        },
      },
    };
  },
  UNSKIP_MANUAL_STEP_REQUESTED: (state, { payload: { imageId, step } }) => {
    return {
      ...state,
      [imageId]: {
        ...state[imageId],
        skippedSteps: {
          ...omit(state[imageId].skippedSteps, step),
        },
      },
    };
  },
}, {});

const reducers: Partial<ReducerMap> = {
  [KEY_IMAGES_LOAD_STATUS]: loadStatusReducer,
  [KEY_IMAGES]: imagesReducer,
  [KEY_TRACING]: tracingReducer,
  [KEY_ACTIVE_IMAGE_ID]: handleActions<typeof KEY_ACTIVE_IMAGE_ID>({
    SET_ACTIVE_IMAGE_ID: (_, { payload: { imageId } }) => imageId,
    RESET_WORKSPACE_REQUESTED: () => null,
  }, null),
};

export default reducers;

export const getAllImages = (state: StoreState) => state[KEY_IMAGES];
export const getAllImagesStatus = (state: StoreState) => state[KEY_IMAGES_LOAD_STATUS];

export const getImageProps = createSelector(
  getAllImages,
  (all) => (imageId: string) => all[imageId],
);

export const getImageStatus = createSelector(
  getAllImagesStatus,
  (all) => (imageId: string) => all[imageId],
);

export const isAnyImageLoading = createSelector(
  getImageStatus,
  (getStatus) => (ids: string[]) => some(ids, id => getStatus(id).isLoading === true),
);

export const hasImageLoadFailed = createSelector(
  getImageStatus,
  (getStatus) => (id: string) => {
    const props = getStatus(id);
    return props.isLoading === false && props.error === null;
  },
);

export const isImageLoaded = createSelector(
  getImageStatus,
  (getStatus) => (id: string) => {
    const props = getStatus(id);
    return props.isLoading === false && props.error !== null;
  },
);

export const hasImage = createSelector(
  getAllImages,
  isImageLoaded,
  (all, isLoaded) => (
    some(all, (_, k: string) => isLoaded(k))
  ),
);

export const getAllTracingData = (state: StoreState) => state[KEY_TRACING];
export const getTracingDataByImageId = createSelector(
  getAllTracingData,
  (all) => (id: string) => all[id],
);

export const getManualLandmarks = createSelector(
  getTracingDataByImageId,
  (getTracing) => (id: string) => getTracing(id).manualLandmarks,
);

export const getSkippedSteps = createSelector(
  getTracingDataByImageId,
  (getTracing) => (id: string) => getTracing(id).skippedSteps,
);

export const getAnalysisId = createSelector(
  getImageProps,
  (getProps) => (id: string) => getProps(id).analysis,
);

export const getActiveImageId = (state: StoreState) => state[KEY_ACTIVE_IMAGE_ID];

export const getScaleFactor = createSelector(
  getImageProps,
  (getProps) => (id: string) => getProps(id).scaleFactor,
);
