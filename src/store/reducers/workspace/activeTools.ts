import assign from 'lodash/assign';
import omit from 'lodash/omit';
import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, combineReducers } from '../../helpers';
import { Event, Tools, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';

type State = StoreEntries.workspace.canvas.activeTools;

const KEY_ACTIVE_TOOLS = StoreKeys.activeTools;
const defaultState: State = {
  [Tools.ADD_POINT]: true,
  [Tools.ZOOM]: true
};

const setActiveTool = handleAction<State, Payloads.setActiveTool>(
  Event.SET_MOUSE_CURSOR_REQUESTED,
  (state, { type, payload: toolId }) => {
    if (toolId === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (state[toolId]) {
      __DEBUG__ && console.warn(
        'Attempted to set an active that already exists, this is a bug!'
      );
      return state;
    }
    return assign({ }, state, { [toolId]: true });
  },
);

const removeActiveTool = handleAction<State, Payloads.removeActiveTool>(
  Event.REMOVE_MOUSE_CURSORS_REQUESTED,
  (state, { type, payload: cursors }) => {
    if (cursors === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (cursors.length === 0) {
      __DEBUG__ && console.warn(
        'removeCursors received an empty array of cursors, this is a bug!'
      );
      return state;
    }
    return omit(state, ...cursors) as State;
  },
);

const activeToolsReducer = wrapWithDefaultState(
  combineReducers<State, GenericAction>(setActiveTool, removeActiveTool),
  defaultState,
);

export default {
  [KEY_ACTIVE_TOOLS]: activeToolsReducer,
};


export const cursorStackSelector = (state: GenericState) => {
  return state[KEY_ACTIVE_TOOLS] as State;
};
