import assign from 'lodash/assign';
import createZoomWithWheel from './zoomWithWheel';
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
) => (
  assign(
    createZoomWithWheel(state),
    {
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
      // onLandmarkMouseEnter(dispatch, symbol) {
      //   // dispatch(temporarilyHideLandmark(symbol));
      // },
      // onLandmarkMouseLeave(dispatch, symbol) {
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
