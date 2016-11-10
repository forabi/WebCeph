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
} from 'store/reducers/workspace/analysis';


import {
  getActiveTreatmentStageId,
} from 'store/reducers/workspace/treatmentStage';

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
        if (landmark !== null) {
          const imageId = getActiveTreatmentStageId(state);
          if (imageId !== null) {
            dispatch(addManualLandmark({
              imageId,
              symbol: landmark.symbol,
              value: { x, y },
            }));
          } else {
            dispatch(addUnnamedManualLandmark({
              imageId,
              value: { x, y },
            }));
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
