import { handleAction } from 'redux-actions';
import { wrapWithDefaultState } from '../../helpers';
import { Event, StoreKeys } from '../../../utils/constants';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';

type ScaleValue = StoreEntries.workspace.canvas.scaleValue;
type ScaleOrigin = StoreEntries.workspace.canvas.scaleOrigin;

const KEY_SCALE = StoreKeys.scaleValue;
const KEY_SCALE_ORIGIN = StoreKeys.scaleOrigin;
const defaultScale: ScaleValue = 1;
const defaultOrigin: ScaleOrigin = null;

const scaleValue = handleAction<ScaleValue, Payloads.setScale>(
  Event.SET_SCALE_REQUESTED,
  (state, { type, payload }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    if (payload.scale === 0) {
      __DEBUG__ && console.warn(
        'Attempted to zoom in by 0, this is a bug!'
      );
      return state;
    }
    return payload.scale;
  },
);

const sacleValueReducer = wrapWithDefaultState(
  scaleValue,
  defaultScale,
);

const scaleOriginReducer = wrapWithDefaultState(
  handleAction<ScaleOrigin, Payloads.setScale>(
    Event.SET_SCALE_REQUESTED,
    (state, { type, payload }) => {
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
  ),
  defaultOrigin,
);


export default {
  [KEY_SCALE]: sacleValueReducer,
  [KEY_SCALE_ORIGIN]: scaleOriginReducer,
};

export const getScale = (state: GenericState) => state[KEY_SCALE] as ScaleValue;
export const getScaleOrigin = (state: GenericState) => state[KEY_SCALE_ORIGIN] as ScaleOrigin;