import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

const KEY_WORKSPACE_MODE: StoreKey = 'workspace.mode';

const reducers: Partial<ReducerMap> = {
  [KEY_WORKSPACE_MODE]: handleActions<typeof KEY_WORKSPACE_MODE>({
    SET_WORKSPACE_MODE_REQUESTED: (_, { payload: { mode } }) => mode,
  }, 'tracing'),
};

export default reducers;

export const getWorkspaceMode = (state: StoreState) => state[KEY_WORKSPACE_MODE];
export const isTracing = createSelector(
  getWorkspaceMode,
  (mode) => mode === 'tracing',
);
export const isSuperimposing = createSelector(
  getWorkspaceMode,
  (mode) => mode === 'superimposition',
);
