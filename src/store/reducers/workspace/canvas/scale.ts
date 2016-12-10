import { handleActions } from 'utils/store';
import { printUnexpectedPayloadWarning } from 'utils/debug';

const KEY_SCALE: StoreKey = 'workspace.canvas.scale.value';
const KEY_SCALE_ORIGIN: StoreKey = 'workspace.canvas.scale.offset';

const defaultScale = 1;
const defaultOrigin = null;

const sacleValueReducer = handleActions<typeof KEY_SCALE>(
  {
    SET_SCALE_REQUESTED: (state, { type, payload }) => {
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
    RESET_WORKSPACE_REQUESTED: () => defaultScale,
  },
  defaultScale,
);

const scaleOriginReducer = handleActions<typeof KEY_SCALE_ORIGIN>(
  {
    SET_SCALE_OFFSET_REQUESTED: (state, { type, payload }) => {
      if (payload === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      if (payload.left === undefined || payload.top === undefined) {
        return null;
      }
      if (payload.left < 0 || payload.top < 0) {
        return state;
      }
      return {
        top: Math.round(payload.top),
        left: Math.round(payload.left),
      };
    },
    RESET_WORKSPACE_REQUESTED: () => defaultOrigin,
  },
  defaultOrigin,
);

export default {
  [KEY_SCALE]: sacleValueReducer,
  [KEY_SCALE_ORIGIN]: scaleOriginReducer,
};

export const getScale = (state: StoreState) => state[KEY_SCALE];
export const getScaleOrigin = (state: StoreState) => state[KEY_SCALE_ORIGIN];
