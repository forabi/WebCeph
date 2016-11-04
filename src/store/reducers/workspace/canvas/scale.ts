import { handleActions } from 'redux-actions';
import { wrapWithDefaultState } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

type ScaleValue = StoreEntries.workspace.canvas.scaleValue;
type ScaleOrigin = StoreEntries.workspace.canvas.scaleOrigin;

const KEY_SCALE = StoreKeys.scaleValue;
const KEY_SCALE_ORIGIN = StoreKeys.scaleOrigin;
const defaultScale: ScaleValue = 1;
const defaultOrigin: ScaleOrigin = null;

const sacleValueReducer = handleActions<ScaleValue, Payloads.setScale>(
  {
    [Event.SET_SCALE_REQUESTED]: (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (payload.scale === 0) {
        console.warn(
          'Attempted to zoom in by 0, this is a bug!'
        );
        return state;
      }
      return payload.scale;
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultScale,
  },
  defaultScale,
);

const scaleOriginReducer = handleActions<ScaleOrigin, Payloads.setScale>(
  {
    [Event.SET_SCALE_REQUESTED]: (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (payload.x === undefined || payload.y === undefined) {
        return null;
      }
      if (payload.x < 0 || payload.y < 0) {
        return state;
      }
      return { x: payload.x, y: payload.y };
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultOrigin,
  },
  defaultOrigin,
);


export default {
  [KEY_SCALE]: sacleValueReducer,
  [KEY_SCALE_ORIGIN]: scaleOriginReducer,
};

export const getScale = (state: GenericState) => state[KEY_SCALE] as ScaleValue;
export const getScaleOrigin = (state: GenericState) => state[KEY_SCALE_ORIGIN] as ScaleOrigin;
