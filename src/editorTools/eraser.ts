import createZoomWithWheel from './zoomWithWheel';
import { Cursor } from 'utils/constants';

import assign from 'lodash/assign';

import {
  removeManualLandmark,
} from 'actions/workspace';

import {
  isLandmarkRemovable,
} from 'store/reducers/workspace/analysis';

import {
  getActiveTreatmentStageId,
} from 'store/reducers/workspace/analysis/tracing/manualLandmarks';

export const createEraser: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => {
  const isRemovable = isLandmarkRemovable(state);
  return assign(
    createZoomWithWheel(state, dispatch),
    {
      onLandmarkClick(symbol) {
        if (isRemovable(symbol)) {
          const stageId = getActiveTreatmentStageId(state);
          dispatch(removeManualLandmark(symbol, stageId));
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

      shouldShowLens: false,
    } as EditorTool,
  );
};

export default createEraser;
