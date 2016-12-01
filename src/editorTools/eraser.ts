import createZoomWithWheel from './zoomWithWheel';
import { Cursor, mapCursor } from 'utils/constants';
import createTrackCursor from './trackCursor';

import assign from 'lodash/assign';

import {
  removeManualLandmark,
} from 'actions/workspace';

import {
  isLandmarkRemovable,
} from 'store/reducers/workspace/analysis';

export const createEraser: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => {
  const isRemovable = isLandmarkRemovable(state);
  return assign(
    createZoomWithWheel(state, dispatch),
    createTrackCursor(state, dispatch),
    {
      onLandmarkClick(symbol) {
        if (isRemovable(symbol)) {
          dispatch(removeManualLandmark(symbol));
        }
      },

      onLandmarkMouseEnter(symbol) {
        if (isRemovable(symbol)) {
          // @TODO: set tooltip: 'Click to remove'
        } else {
          // @TODO: set tooltip: 'Cannot remove'
        }
      },

      onLandmarkMouseLeave(_) {
        // @TODO
      },

      onCanvasMouseEnter() {
        // @TODO
      },

      onCanvasMouseLeave() {
        // @TODO
      },

      getCursorForLandmark(symbol) {
        if (isRemovable(symbol)) {
          return Cursor.REMOVE_LANDMARK;
        }
        return Cursor.REMOVE_LANDMARK_DISABLED;
      },

      getCursorForCanvas() {
        return Cursor.REMOVE_LANDMARK_NO_TARGET;
      },

      getPropsForLandmark(symbol) {
        if (isRemovable(symbol)) {
          return {
            fill: '#af2121',
            stroke: '#751616',
            style: {
              pointerEvents: undefined,
              cursor: mapCursor(Cursor.REMOVE_LANDMARK),
              transform: 'scale(1.3)',
            },
          };
        } else {
          return {
            style: {
              cursor: mapCursor(Cursor.REMOVE_LANDMARK_DISABLED),
            },
          };
        }
      },

      shouldShowLens: false,
    } as EditorTool,
  );
};

export default createEraser;
