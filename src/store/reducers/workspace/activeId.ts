import { handleActions } from 'utils/store';

const KEY_ACTIVE_WORKSPACE_ID: StoreKey = 'workspaces.activeWorkspaceId';

const reducers: Partial<ReducerMap> = {
  [KEY_ACTIVE_WORKSPACE_ID]: handleActions<typeof KEY_ACTIVE_WORKSPACE_ID>({
    SET_ACTIVE_WORKSPACE: (_, { payload: { id } }) => id,
  }, null),
};

export default reducers;

export const getActiveWorkspaceId = (state: StoreState) => state[KEY_ACTIVE_WORKSPACE_ID];
