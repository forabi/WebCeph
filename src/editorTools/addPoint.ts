import createZoomWithWheel from './zoomWithWheel';
import createTrackCursor from './trackCursor';
import { Cursor } from 'utils/constants';

import {
  addUnnamedManualLandmark,
  addManualLandmark,
} from 'actions/workspace';

import {
  getExpectedNextManualLandmark,
  isAnalysisComplete,
} from 'store/reducers/workspace/analysis';
import { getActiveImageId } from 'store/reducers/workspace/image';

export const createAddPoint: EditorToolCreator = (
  state: StoreState,
): EditorTool => ({
  ...createZoomWithWheel(state),
  ...createTrackCursor(state),
  onCanvasMouseEnter(_) {
    if (!isAnalysisComplete(state)) {
      // @TODO
    }
  },
  onCanvasMouseLeave(_) {
    // @TODO
  },
  onCanvasLeftClick(dispatch, x, y) {
    const landmark = getExpectedNextManualLandmark(state);
    const imageId = getActiveImageId(state);
    const value = { x, y };
    if (landmark !== null) {
      dispatch(addManualLandmark({
        imageId,
        symbol: landmark.symbol,
        value,
      }));
    } else {
      dispatch(addUnnamedManualLandmark({
        imageId,
        value,
      }));
    }
  },
  getCursorForCanvas() {
    return Cursor.ADD_LANDMARK;
  },

  shouldShowLens: true,
});

export default createAddPoint;
