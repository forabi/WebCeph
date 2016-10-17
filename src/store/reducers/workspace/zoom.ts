import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, combineReducers } from '../../helpers';
import { Event, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';

type ZoomValue = StoreEntries.workspace.canvas.zoom;
type ZoomOffset = StoreEntries.workspace.canvas.zoomOffset;

const KEY_ZOOM = StoreKeys.zoomValue;
const KEY_ZOOM_OFFSET = StoreKeys.zoomOffset;
const defaultState: ZoomValue = 100;
const defaultOffset: ZoomOffset = { x: 0, y: 0 };

const canChangeZoom = (zoom: number, current: number) => {
  const change = current + zoom;
  return change >= 0 && change < 500;
}

const zoomValue = handleAction<ZoomValue, Payloads.zoomIn>(
  Event.ZOOM_IN_REQUESTED,
  (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (payload.zoom === 0) {
      __DEBUG__ && console.warn(
        'Attempted to zoom in by 0, this is a bug!'
      );
      return state;
    }
    console.log(payload);
    if (!canChangeZoom(payload.zoom, state)) {
      return state;
    }
    return state + payload.zoom;
  },
);

const zoomValueReducer = wrapWithDefaultState(
  zoomValue,
  defaultState,
);

const zoomOffsetReducer = wrapWithDefaultState(
  handleAction<ZoomOffset, Payloads.zoomIn>(
    Event.ZOOM_IN_REQUESTED,
    (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (payload.x < 0 || payload.y < 0) {
        return state;
      }
      if (payload.x === state.x && payload.y === state.y) {
        return state;
      }
      return { x: payload.x, y: payload.y };
    },
  ),
  defaultOffset,
);


export default {
  [KEY_ZOOM]: zoomValueReducer,
  [KEY_ZOOM_OFFSET]: zoomOffsetReducer,
};
