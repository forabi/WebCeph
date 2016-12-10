import { handleAction } from 'redux-actions';
import { wrapWithDefaultState } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

type Top = StoreEntries.workspace.canvas.top;
type Left = StoreEntries.workspace.canvas.left;

const KEY_CANVAS_TOP = StoreKeys.canvasTop;
const KEY_CANVAS_LEFT = StoreKeys.canvasLeft;
const defaultLeft: Left = null;
const defaultTop: Top = null;

const setTop = wrapWithDefaultState(
  handleAction<Left, Payloads.updateCanvasSize>(
    Event.CANVAS_RESIZED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload.top;
    },
  ),
  defaultTop,
);

const setLeft = wrapWithDefaultState(
  handleAction<Top, Payloads.updateCanvasSize>(
    Event.CANVAS_RESIZED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload.left;
    },
  ),
  defaultLeft,
);

export default {
  [KEY_CANVAS_TOP]: setTop,
  [KEY_CANVAS_LEFT]: setLeft,
};


export const getCanvasTop = (state: StoreState) => {
  return state[KEY_CANVAS_LEFT] as Top;
};

export const getCanvasLeft = (state: StoreState) => {
  return state[KEY_CANVAS_TOP] as Left;
};

export const getCanvasPosition = createSelector(
  getCanvasTop,
  getCanvasLeft,
  (top, left) => ({ top, left }),
);
