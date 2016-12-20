import createZoomWithWheel from './zoomWithWheel';
import { Cursor, mapCursor } from 'utils/constants';
import createTrackCursor from './trackCursor';

import {
  removeManualLandmark,
} from 'actions/workspace';

import {
  isStepRemovable,
} from 'store/reducers/workspace/analyses';

export const createEraser: EditorToolCreator = (
  state: StoreState,
) => {
  const isRemovable = isStepRemovable(state);
  return {
    ...createZoomWithWheel(state),
    ...createTrackCursor(state),
    onLandmarkClick(dispatch, symbol) {
      if (isRemovable(symbol)) {
        dispatch(removeManualLandmark(symbol));
      }
    },

    onLandmarkMouseEnter(_, symbol) {
      if (isRemovable(symbol)) {
        // @TODO: set tooltip: 'Click to remove'
      } else {
        // @TODO: set tooltip: 'Cannot remove'
      }
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
  };
};

export default createEraser;
