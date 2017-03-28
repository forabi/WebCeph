import { handleActions } from 'utils/store';
import { defaultWorkspaceId } from 'utils/config';

const KEY_ACTIVE_WORKSPACE_ID: StoreKey = 'workspaces.activeWorkspaceId';

const reducers: Partial<ReducerMap> = {
  [KEY_ACTIVE_WORKSPACE_ID]: handleActions<typeof KEY_ACTIVE_WORKSPACE_ID>({
    SET_ACTIVE_WORKSPACE: (_, { payload: { id } }) => id,
    ADD_NEW_WORKSPACE: (state, { payload: { id } }) => state === null ? id : state,
  }, defaultWorkspaceId),
};

export default reducers;

export const getActiveWorkspaceId = (state: StoreState) => state[KEY_ACTIVE_WORKSPACE_ID];
