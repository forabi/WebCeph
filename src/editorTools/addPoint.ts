import createZoomWithWheel from './zoomWithWheel';
import createTrackCursor from './trackCursor';
import { Cursor } from 'utils/constants';

import {
  addUnnamedManualLandmark,
  addManualLandmark,
  showTemporarilyHiddenLandmark,
  temporarilyHideLandmark,
} from 'actions/workspace';

import {
  getExpectedNextManualLandmark,
  isAnalysisComplete,
} from 'store/reducers/workspace/analysis';

export const createAddPoint: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
): EditorTool => ({
  ...createZoomWithWheel(state, dispatch),
  ...createTrackCursor(state, dispatch),
  onCanvasMouseEnter() {
    if (!isAnalysisComplete(state)) {
      // @TODO
    }
  },
  onCanvasMouseLeave() {
    // @TODO
  },
  onCanvasLeftClick(x, y) {
    const landmark = getExpectedNextManualLandmark(state);
    if (landmark !== null) {
      dispatch(addManualLandmark(landmark.symbol, { x, y }));
    } else {
      dispatch(addUnnamedManualLandmark({ x, y }));
    }
  },
  // onLandmarkMouseEnter(symbol) {
  //   // dispatch(temporarilyHideLandmark(symbol));
  // },
  // onLandmarkMouseLeave(symbol) {
  //   // dispatch(showTemporarilyHiddenLandmark(symbol));
  // },
  getCursorForCanvas() {
    return Cursor.ADD_LANDMARK;
  },

  shouldShowLens: true,
});

export default createAddPoint;
