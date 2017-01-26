import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

import omit from 'lodash/omit';

const KEY_WORKSPACE_SETTINGS: StoreKey = 'workspaces.settings';

const reducers: Partial<ReducerMap> = {
  [KEY_WORKSPACE_SETTINGS]: handleActions<typeof KEY_WORKSPACE_SETTINGS>({
    ADD_NEW_WORKSPACE: (state, { payload: { id, settings } }) => {
      return {
        ...state,
        [id]: {
          ...settings,
          mode: 'tracing',
          tracing: {
            imageId: null,
          },
          superimposition: {
            mode: 'auto',
            imageIds: [],
          },
        },
      };
    },
    REMOVE_WORKSPACE: (state, id) => omit(state, id) as typeof state,
    SET_SUPERIMPOSITION_MODE_REQUESTED: (state, { payload: { id, mode } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          superimposition: {
            ...state[id].superimposition,
            mode,
          },
        },
      };
    },
    SET_WORKSPACE_MODE_REQUESTED: (state, { payload: { id, mode } }) => {
      return {
        ...state,
        [id]: {
          ...state[id],
          mode,
        },
      };
    },
    SUPERIMPOSE_IMAGES_REQUESTED: (state, { payload: { workspaceId, imageIds }}) => {
      return {
        ...state,
        [workspaceId]: {
          ...state[workspaceId],
          superimposition: {
            ...state[workspaceId].superimposition,
            imageIds,
          },
        },
      };
    },
    SET_ACTIVE_IMAGE_ID: (state, { payload: { workspaceId, imageId }}) => {
      return {
        ...state,
        [workspaceId]: {
          ...state[workspaceId],
          tracing: {
            ...state[workspaceId].tracing,
            imageId,
          },
        },
      };
    },
  }, { }),
};

export default reducers;

export const getAllWorkspacesSettings = (state: StoreState) => state[KEY_WORKSPACE_SETTINGS];

export const getWorkspaceSettingsById = createSelector(
  getAllWorkspacesSettings,
  settings => (workspaceId: string) => settings[workspaceId],
);

export const getWorkspaceMode = createSelector(
  getWorkspaceSettingsById,
  getSettings => (workspaceId: string) => getSettings(workspaceId).mode,
);

export const isTracing = createSelector(
  getWorkspaceMode,
  (getMode) => (id: string) => getMode(id) === 'tracing',
);
export const isSuperimposing = createSelector(
  getWorkspaceMode,
  (getMode) => (id: string) => getMode(id) === 'superimposition',
);

export const getSuperimpositionSettingsByWorkspaceId = createSelector(
  getWorkspaceSettingsById,
  (getSettings) => (id: string) => getSettings(id).superimposition,
);

export const getSuperimpsotionMode = createSelector(
  getSuperimpositionSettingsByWorkspaceId,
  (getSettings) => (id: string) => getSettings(id).mode,
);

export const getSuperimposedImages = createSelector(
  getSuperimpositionSettingsByWorkspaceId,
  (getSettings) => (id: string) => getSettings(id).imageIds,
);

export const getTracingImageId = createSelector(
  getWorkspaceSettingsById,
  (getSettings) => (workspaceId: string) => getSettings(workspaceId).tracing.imageId,
);

