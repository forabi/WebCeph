import { handleActions } from 'utils/store';

import without from 'lodash/without';

const KEY_WORKSPACES_ORDER: StoreKey = 'workspaces.order';

const reducers: Partial<ReducerMap> = {
  [KEY_WORKSPACES_ORDER]: handleActions<typeof KEY_WORKSPACES_ORDER>({
    ADD_NEW_WORKSPACE: (state, { payload: { id } }) => [...state, id],
    REMOVE_WORKSPACE: (state, { payload: { id }}) => without(state, id),
  }, []),
};

export default reducers;

export const getWorkspacesIdsInOrder = (state: StoreState) => state[KEY_WORKSPACES_ORDER];
