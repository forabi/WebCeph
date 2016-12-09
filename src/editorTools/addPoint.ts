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
    if (landmark !== null) {
      dispatch(addManualLandmark(landmark.symbol, { x, y }));
    } else {
      dispatch(addUnnamedManualLandmark({ x, y }));
    }
  },
  getCursorForCanvas() {
    return Cursor.ADD_LANDMARK;
  },

  shouldShowLens: true,
});

export default createAddPoint;
