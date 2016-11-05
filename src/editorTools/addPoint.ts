import assign from 'lodash/assign';
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
  getActiveTracingStageId,
} from 'store/reducers/workspace/analysis';

export const createAddPoint: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => (
  assign(
    createZoomWithWheel(state, dispatch),
    createTrackCursor(state, dispatch),
    {
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
        const stage = getActiveTracingStageId(state);
        if (stage !== null) {
          if (landmark !== null) {
            dispatch(addManualLandmark(landmark.symbol, stage, { x, y }));
          } else {
            dispatch(addUnnamedManualLandmark(stage, { x, y }));
          }
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
    } as EditorTool,
  )
);

export default createAddPoint;
