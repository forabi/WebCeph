import {
  addUnnamedManualLandmark,
  addManualLandmark,
  removeManualLandmark,
  showTemporarilyHiddenLandmark,
  temporarilyHideLandmark,
  setCursor, removeCursors,
  zoomIn, zoomOut,
} from './workspace';
import keyBy from 'lodash/keyBy';
import { Cursor } from '../utils/constants';
import { getZoomSelector, isLandmarkRemovableSelector } from '../store/selectors/workspace';

type isLandmarkRemovable = (symbol: string) => boolean;

export const Eraser: EditorToolCreator = (
  dispatch: DispatchFunction,
  state,
) => {
  const isLandmarkRemovable = isLandmarkRemovableSelector(state);
  return {
    id: 'eraser',

    onLandmarkClick(symbol) {
      if (isLandmarkRemovable(symbol)) {
        dispatch(removeManualLandmark(symbol));
      }
    },

    onLandmarkMouseEnter(symbol) {
      if (isLandmarkRemovable(symbol)) {
        dispatch(setCursor(Cursor.REMOVE_LANDMARK));
      }
      dispatch(setCursor(Cursor.REMOVE_LANDMARK_DISABLED));
    },

    onLandmarkMouseLeave(_) {
      dispatch(removeCursors([
        Cursor.REMOVE_LANDMARK,
        Cursor.REMOVE_LANDMARK_DISABLED,
      ]));
    },

    onCanvasMouseEnter() {
      dispatch(setCursor(Cursor.REMOVE_LANDMARK_NO_TARGET));
    },

    onCanvasMouseLeave() {
      dispatch(removeCursors([
        Cursor.REMOVE_LANDMARK_NO_TARGET,
        Cursor.REMOVE_LANDMARK,
        Cursor.REMOVE_LANDMARK_DISABLED,
      ]));
    },
  };
};

export const AddPoint: EditorToolCreator = (
  dispatch: DispatchFunction,
  getExpectedNextManualLandmark: () => string | null,
) => ({
  id: 'add-point',
  onCanvasMouseEnter() {
    dispatch(setCursor(Cursor.ADD_LANDMARK));
  },
  onCanvasMouseLeave() {
    dispatch(removeCursors([
      Cursor.ADD_LANDMARK,
    ]));
  },
  onCanvasLeftClick(x, y) {
    const symbol = getExpectedNextManualLandmark();
    if (symbol !== null) {
      dispatch(addManualLandmark(symbol, { x, y }))
    } else {
      dispatch(addUnnamedManualLandmark({ x, y }));
    }
  },
  onLandmarkMouseEnter(symbol) {
    dispatch(temporarilyHideLandmark(symbol));
  },
  onLandmarkMouseLeave(symbol) {
    dispatch(showTemporarilyHiddenLandmark(symbol));
  },
});

export const Zoom: EditorToolCreator = (
  dispatch: DispatchFunction,
  state,
) => ({
  id: 'zoom-in-out',
  onCanvasMouseEnter() {
    dispatch(setCursor(Cursor.ZOOM));
  },
  onCanvasMouseLeave() {
    dispatch(removeCursors([
      Cursor.ZOOM,
    ]));
  },
  onCanvasLeftClick(x, y) {
    dispatch(zoomIn(10 , x, y));
  },
  onCanvasRightClick(x, y) {
    dispatch(zoomOut(10, x, y));
  },
  onCanvasMouseWheel(x, y, delta) {
    const currentZoom = getZoomSelector(state);
    const zoomIntensity = 1;
    const zoom = (Math.round(100 * Math.abs(delta / 120)) / 100);
    console.log('Zoom Zoom', zoom);
    if (delta > 0) {
      dispatch(zoomIn(zoom, x, y));
    } else {
      dispatch(zoomOut(zoom, x, y));
    }
  },
});

const tools = keyBy({
  Zoom,
  AddPoint,
  Eraser,
}, (tool: EditorTool) => tool.id);

export function createCompositeTool(dispatch): EditorTool {
  return Zoom(dispatch);
}