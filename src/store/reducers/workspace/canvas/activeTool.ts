import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, reduceReducers } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import Tools, { ToolsIds } from 'editorTools';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

type ToolId = StoreEntries.workspace.canvas.activeTool;

const KEY_ACTIVE_TOOL = StoreKeys.activeTool;
const defaultTool: ToolId = ToolsIds.ADD_POINT;

const setActiveTool = handleAction<ToolId, Payloads.setActiveTool>(
  Event.TOGGLE_TOOL_REQUESTED,
  (state, { type, payload: symbol }) => {
    if (symbol === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return symbol;
  },
);

const disableActiveTool = handleAction<ToolId, Payloads.disableActiveTool>(
  Event.DISABLE_TOOL_REQUESTED,
  (state, { type, payload }) => {
    if (payload !== undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return defaultTool;
  },
);

const activeToolReducer = wrapWithDefaultState(
  reduceReducers<ToolId, GenericAction>(setActiveTool, disableActiveTool),
  defaultTool,
);

export default {
  [KEY_ACTIVE_TOOL]: activeToolReducer,
};


export const getActiveToolId = (state: GenericState): ToolId => {
  return state[KEY_ACTIVE_TOOL];
};

export const createActiveTool = createSelector(
  getActiveToolId,
  (id): EditorToolCreator => Tools[id],
);

