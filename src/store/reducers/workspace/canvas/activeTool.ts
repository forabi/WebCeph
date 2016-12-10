import { handleActions } from 'utils/store';
import Tools, { ToolsIds } from 'editorTools';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

const KEY_ACTIVE_TOOL: StoreKey = 'workspace.canvas.tools.activeToolId';
const defaultTool = ToolsIds.ADD_POINT;

const reducers = {
  [KEY_ACTIVE_TOOL]: handleActions<typeof KEY_ACTIVE_TOOL>(
    {
      SET_ACTIVE_TOOL_REQUESTED: (state, { type, payload: id }) => {
        if (id === undefined) {
          printUnexpectedPayloadWarning(type, state);
          return state;
        }
        return id;
      },
    },
    defaultTool,
  ),
};

export default reducers;

export const getState = (state: StoreState) => state;

export const getActiveToolId = (state: StoreState) => state[KEY_ACTIVE_TOOL];

export const getActiveTool = createSelector(
  getState,
  getActiveToolId,
  (state, id) => Tools[id](state),
);

