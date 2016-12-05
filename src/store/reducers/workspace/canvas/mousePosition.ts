import { handleAction } from 'redux-actions';
import { wrapWithDefaultState } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

type MouseX = StoreEntries.workspace.canvas.mouseX;
type MouseY = StoreEntries.workspace.canvas.mouseY;

const KEY_MOUSE_X = StoreKeys.canvasMouseX;
const KEY_MOUSE_Y = StoreKeys.canvasMouseY;
const defaultMouseX: MouseY = null;
const defaultMouseY: MouseX = null;

const setY = wrapWithDefaultState(
  handleAction<MouseY, Payloads.updateMousePosition>(
    Event.MOUSE_POSITION_CHANGED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return Math.round(payload.y);
    },
  ),
  defaultMouseY,
);

const setX = wrapWithDefaultState(
  handleAction<MouseX, Payloads.updateMousePosition>(
    Event.MOUSE_POSITION_CHANGED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return Math.round(payload.x);
    },
  ),
  defaultMouseX,
);

export default {
  [KEY_MOUSE_X]: setY,
  [KEY_MOUSE_Y]: setX,
};


export const getMouseX = (state: GenericState) => {
  return state[KEY_MOUSE_Y] as MouseX;
};

export const getMouseY = (state: GenericState) => {
  return state[KEY_MOUSE_X] as MouseY;
};

export const getMousePosition = createSelector(
  getMouseX,
  getMouseY,
  (x, y) => ({ x, y }),
);
