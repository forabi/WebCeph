import find from 'lodash/find';
import without from 'lodash/without';
import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, combineReducers } from '../../helpers';
import { Event, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';

type State = StoreEntries.workspace.canvas.cursorStack;

const KEY_CURSOR_STACK = StoreKeys.cursorStack;
const defaultState: State = [];

const addCursor = handleAction<State, Payloads.setCursor>(
  Event.SET_MOUSE_CURSOR_REQUESTED,
  (state, { type, payload: cursor }) => {
    if (cursor === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (find(state, cursor)) {
      __DEBUG__ && console.warn(
        'Attempted to set a cursor that already exists, this is a bug!'
      );
      return state;
    }
    return [cursor, ...state];
  },
);

const removeCursors = handleAction<State, Payloads.removeCursors>(
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
    return without(state, ...cursors) as State;
  },
);

const cursorStackReducer = wrapWithDefaultState(
  combineReducers<State, GenericAction>(addCursor, removeCursors),
  defaultState,
);

export default {
  [KEY_CURSOR_STACK]: cursorStackReducer,
};


export const cursorStackSelector = (state: GenericState) => {
  return state[KEY_CURSOR_STACK] as State;
};

export const getActiveCursor = (state: GenericState) => {
  return state[KEY_CURSOR_STACK][0] as string | undefined;
}