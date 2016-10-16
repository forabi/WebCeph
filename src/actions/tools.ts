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

type isLandmarkRemovable = (symbol: string) => boolean;

export const Eraser: EditorToolCreator = (
  dispatch: DispatchFunction,
  isLandmarkRemovable: isLandmarkRemovable
) => ({
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
});

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
    dispatch(zoomIn(0.1 , x, y));
  },
  onCanvasRightClick(x, y) {
    dispatch(zoomOut(0.1, x, y));
  },
  onCanvasMouseWheel(x, y, delta) {
    const zoom = Math.abs(Math.round(delta / 100));
    if (delta < 0) {
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