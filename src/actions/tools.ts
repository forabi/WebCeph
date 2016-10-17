import {
  addUnnamedManualLandmark,
  addManualLandmark,
  removeManualLandmark,
  showTemporarilyHiddenLandmark,
  temporarilyHideLandmark,
  setCursor, removeCursors,
  zoomIn, zoomOut,
} from './workspace';
import assign from 'lodash/assign';
import { Cursor } from '../utils/constants';
import { isLandmarkRemovableSelector, nextManualLandmarkSelector } from '../store/selectors/workspace';


export const ZoomWithWheel: EditorToolCreator = (
  _: GenericState,
  dispatch: DispatchFunction,
) => ({
  onCanvasMouseEnter() {
    dispatch(setCursor(Cursor.ZOOM));
  },
  onCanvasMouseLeave() {
    dispatch(removeCursors([
      Cursor.ZOOM,
    ]));
  },
  onCanvasMouseWheel(x, y, delta) {
    const zoom = (Math.round(100 * Math.abs(delta / 120)) / 100);
    console.log('Zoom Zoom', zoom);
    if (delta > 0) {
      dispatch(zoomIn(zoom, x, y));
    } else {
      dispatch(zoomOut(zoom, x, y));
    }
  },
});

export const Eraser: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => {
  const isLandmarkRemovable = isLandmarkRemovableSelector(state);
  return assign(
    ZoomWithWheel(state, dispatch),
    {
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
    } as EditorTool,
  );
};

export const ZoomWithClick: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => (assign(
  ZoomWithWheel(state, dispatch),
  {
    onCanvasLeftClick(x, y) {
      dispatch(zoomIn(10 , x, y));
    },
    onCanvasRightClick(x, y) {
      dispatch(zoomOut(10, x, y));
    },
  } as EditorTool,
));

export const AddPoint: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => (assign(
  ZoomWithWheel(state, dispatch),
  {
    onCanvasMouseEnter() {
      dispatch(setCursor(Cursor.ADD_LANDMARK));
    },
    onCanvasMouseLeave() {
      dispatch(removeCursors([
        Cursor.ADD_LANDMARK,
      ]));
    },
    onCanvasLeftClick(x, y) {
      const landmark = nextManualLandmarkSelector(state);
      if (landmark !== null) {
        dispatch(addManualLandmark(landmark.symbol, { x, y }))
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
  } as EditorTool,
));