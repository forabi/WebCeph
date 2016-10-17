import { Event, Cursor } from '../utils/constants';
import { createAction } from 'redux-actions';
/* Tracing actions */
export const setActiveTool: (symbol: string) => any = createAction(
  Event.TOGGLE_TOOL_REQUESTED,
);

export const disableActiveTool: () => any = createAction(
  Event.DISABLE_TOOL_REQUESTED,
);

export const addManualLandmark: (symbol: string, value: GeometricalObject | number) => any = createAction(
  Event.ADD_MANUAL_LANDMARK_REQUESTED,
  (symbol: string, value: GeometricalObject): Payloads.addManualLandmark => ({ symbol, value }),
);

export const addUnnamedManualLandmark: (value: GeometricalObject | number) => any = createAction(
  Event.ADD_UNKOWN_MANUAL_LANDMARK_REQUESTED,
);

export const removeManualLandmark: (symbol: string) => any = createAction(
  Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
  (symbol: string): Payloads.removeManualLandmark => (symbol),
);

export const temporarilyHideLandmark: (symbol: string) => any = createAction(
  Event.HIDE_LANDMARK_TEMPORARILY_REQUESTED,
);

export const showTemporarilyHiddenLandmark: (symbol: string) => any = createAction(
  Event.SHOW_TEMORARILY_HIDDEN_LANDMARK_REQUESTED,
);

export const setCursor: (cursor: Cursor) => any = createAction(
  Event.SET_MOUSE_CURSOR_REQUESTED,
);

export const removeCursors: (cursors: Cursor[]) => any = createAction(
  Event.REMOVE_MOUSE_CURSORS_REQUESTED,
);

export const zoomIn: (zoom: number, x: number, y: number) => any = createAction(
  Event.ZOOM_IN_REQUESTED,
  (zoom: number, x: number, y: number) => ({ zoom, x, y } as Payloads.zoomIn),
);

export const zoomOut: (zoom: number, x: number, y: number) => any = createAction(
  Event.ZOOM_IN_REQUESTED,
  (zoom: number, x: number, y: number) => ({ zoom: -zoom, x, y } as Payloads.zoomIn),
);

/** Performs steps in the cephalometric analysis that can be automatically evaluated in the current state.
 * This may include calculating an angle (i.e SNA) provided that all three points (S, N and A) have been set
*/
export const tryAutomaticSteps: () => any = createAction(Event.TRY_AUTOMATIC_STEPS_REQUESTED);

/* Image editing actions */
export const loadImageFile: (options: { file: File, height: number, width: number }) => any = createAction(Event.LOAD_IMAGE_REQUESTED);
export const flipImageX: () => any = createAction(Event.FLIP_IMAGE_X_REQUESTED);
export const setBrightness: (value: number) => any = createAction(Event.SET_IMAGE_BRIGHTNESS_REQUESTED);
export const setContrast: (value: number) => any = createAction(Event.SET_IMAGE_CONTRAST_REQUESTED);
export const invertImage: () => any = createAction(Event.INVERT_IMAGE_REQUESTED);
export const resetWorkspace: () => any = createAction(Event.RESET_WORKSPACE_REQUESTED);
export const ignoreWorkspaceError: () => any = createAction(Event.IGNORE_WORKSPACE_ERROR_REQUESTED);

/**
 * Ignores the result of automatic detection of whether the image is a cephalometric radiograph
 */
export const ignoreLikelyNotCephalo: () => any = createAction(
  Event.SET_IS_CEPHALO_REQUESTED,
  () => ({ isCephalo: true }),
);

export const showAnalysisResults: () => void = createAction(Event.SHOW_ANALYSIS_RESULTS_REQUESTED); 
export const closeAnalysisResults: () => void = createAction(Event.CLOSE_ANALYSIS_RESULTS_REQUESTED);

export const highlightStepsOnCanvas: (symbols: string[]) => void = createAction(Event.HIGHLIGHT_STEPS_ON_CANVAS_REQUESTED);
export const unhighlightStepsOnCanvas: (symbols: string[]) => void = createAction(Event.UNHIGHLIGHT_STEPS_ON_CANVAS_REQUESTED);

export const redo: () => void = createAction(Event.REDO_REQUESTED);
export const undo: () => void = createAction(Event.UNDO_REQUESTED);
