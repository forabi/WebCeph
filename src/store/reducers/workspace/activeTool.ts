import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, combineReducers } from '../../helpers';
import { Event, Tools, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';

type State = StoreEntries.workspace.canvas.activeTool;

const KEY_ACTIVE_TOOL = StoreKeys.activeTool;
const defaultState: State = Tools.ADD_POINT;

const setActiveTool = handleAction<State, Payloads.setActiveTool>(
  Event.TOGGLE_TOOL_REQUESTED,
  (state, { type, payload: symbol }) => {
    if (symbol === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return symbol;
  },
);

const disableActiveTool = handleAction<State, Payloads.disableActiveTool>(
  Event.DISABLE_TOOL_REQUESTED,
  (state, { type, payload }) => {
    if (payload !== undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return null;
  },
);

const activeToolReducer = wrapWithDefaultState(
  combineReducers<State, GenericAction>(setActiveTool, disableActiveTool),
  defaultState,
);

export default {
  [KEY_ACTIVE_TOOL]: activeToolReducer,
};


export const activeToolSelector = (state: GenericState) => {
  return state[KEY_ACTIVE_TOOL] as State;
};
