import { handleAction } from 'redux-actions';
import { wrapWithDefaultState, combineReducers } from '../../helpers';
import { Event, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';

type ZoomValue = StoreEntries.workspace.canvas.zoom;

const KEY_ZOOM = StoreKeys.zoomValue;
const defaultState: ZoomValue = 1;

const zoomIn = handleAction<ZoomValue, Payloads.zoomIn>(
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
    return state + payload.zoom;
  },
);

const zoomOut = handleAction<ZoomValue, Payloads.zoomOut>(
  Event.ZOOM_OUT_REQUESTED,
  (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (payload.zoom === 0) {
      __DEBUG__ && console.warn(
        'Attempted to zoom by 0, this is a bug!'
      );
      return state;
    }
    return state - payload.zoom;
  },
);

const zoomReducer = wrapWithDefaultState(
  combineReducers<ZoomValue, GenericAction>(zoomIn, zoomOut),
  defaultState,
);

export default {
  [KEY_ZOOM]: zoomReducer,
};


export const manualLandmarksSelector = (state: GenericState) => {
  return state[KEY_ZOOM] as ZoomValue;
};
