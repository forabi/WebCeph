import { handleAction } from 'redux-actions';
import { wrapWithDefaultState } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { createSelector } from 'reselect';

type Height = StoreEntries.workspace.canvas.height;
type Width = StoreEntries.workspace.canvas.width;

const KEY_CANVAS_HEIGHT = StoreKeys.canvasHeight;
const KEY_CANVAS_WIDTH = StoreKeys.canvasWidth;
const defaultWidth: Height = 750;
const defaultHeight: Width = 550;

const setHeight = wrapWithDefaultState(
  handleAction<Height, Payloads.updateCanvasSize>(
    Event.CANVAS_RESIZED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload.height;
    },
  ),
  defaultHeight,
);

const setWidth = wrapWithDefaultState(
  handleAction<Width, Payloads.updateCanvasSize>(
    Event.CANVAS_RESIZED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return payload.width;
    },
  ),
  defaultWidth,
);

export default {
  [KEY_CANVAS_HEIGHT]: setHeight,
  [KEY_CANVAS_WIDTH]: setWidth,
};


export const getCanvasWidth = (state: StoreState) => {
  return state[KEY_CANVAS_WIDTH] as Width;
};

export const getCanvasHeight = (state: StoreState) => {
  return state[KEY_CANVAS_HEIGHT] as Height;
};

export const getCanvasSize = createSelector(
  getCanvasWidth,
  getCanvasHeight,
  (width, height) => ({ width, height }),
);
