import {
  addUnnamedManualLandmark,
  removeManualLandmark,
  showTemporarilyHiddenLandmark,
  temporarilyHideLandmark,
  setCursor, removeCursors,
  zoomIn, zoomOut,
} from './workspace';
import { Cursor, ScrollDirection } from '../utils/constants';

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
    dispatch(addUnnamedManualLandmark({ x, y }));
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
    dispatch(zoomIn(x, y));
  },
  onCanvasRightClick(x, y) {
    dispatch(zoomOut(x, y));
  },
  onCanvasScroll(x, y, direction) {
    if (direction === ScrollDirection.NORMAL) {
      dispatch(zoomIn(x, y));
    } else {
      dispatch(zoomOut(x, y));
    }
  },
});