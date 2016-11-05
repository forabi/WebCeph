import { createAction } from 'redux-actions';
import { Event } from 'utils/constants';

/* Tracing actions */
export const setActiveTool: (symbol: string) => Action<Payloads.setActiveTool> = createAction(
  Event.TOGGLE_TOOL_REQUESTED,
);

export const disableActiveTool: () => Action<Payloads.disableActiveTool> = createAction(
  Event.DISABLE_TOOL_REQUESTED,
);

export const addManualLandmark:
  (symbol: string, stage: string, value: GeometricalObject) => Action<Payloads.addManualLandmark> =
  createAction(
    Event.ADD_MANUAL_LANDMARK_REQUESTED,
    (symbol: string, stage: string, value: GeometricalObject): Payloads.addManualLandmark => ({ symbol, stage, value }),
  );

export const addUnnamedManualLandmark:
  (stage: string, value: GeometricalObject) => Action<Payloads.addUnnamedManualLandmark> =
  createAction(
    Event.ADD_UNKOWN_MANUAL_LANDMARK_REQUESTED,
    (stage: string, value: GeometricalObject): Payloads.addUnnamedManualLandmark => ({ stage, value }),
  );

export const removeManualLandmark:
(symbol: string, stage: string) => Action<Payloads.removeManualLandmark> =
  createAction(
    Event.REMOVE_MANUAL_LANDMARK_REQUESTED,
    (symbol: string, stage: string): Payloads.removeManualLandmark => ({ symbol, stage }),
  );

export const temporarilyHideLandmark: (symbol: string) => any = createAction(
  Event.HIDE_LANDMARK_TEMPORARILY_REQUESTED,
);

export const showTemporarilyHiddenLandmark: (symbol: string) => any = createAction(
  Event.SHOW_TEMORARILY_HIDDEN_LANDMARK_REQUESTED,
);

export const setScale: (scale: number, x?: number, y?: number) => Action<Payloads.setScale> = createAction(
  Event.SET_SCALE_REQUESTED,
  (scale: number, x: number, y: number): Payloads.setScale => ({ scale, x, y }),
);

/** Performs steps in the cephalometric analysis that can be automatically evaluated in the current state.
 * This may include calculating an angle (i.e SNA) provided that all three points (S, N and A) have been set
 */
export const tryAutomaticSteps: () => any = createAction(Event.TRY_AUTOMATIC_STEPS_REQUESTED);

/* Image editing actions */
export const loadImageFile:
  (file: File) => Action<Payloads.imageLoadRequested> =
    createAction(Event.LOAD_IMAGE_REQUESTED);

export const flipX: () => Action<Payloads.flipImageX> = createAction(Event.FLIP_IMAGE_X_REQUESTED);
export const flipY: () => Action<Payloads.flipImageY> = createAction(Event.FLIP_IMAGE_Y_REQUESTED);
export const setBrightness:
  (value: number) => Action<Payloads.setBrightness> =
    createAction(Event.SET_IMAGE_BRIGHTNESS_REQUESTED);

export const setContrast:
  (value: number) => Action<Payloads.setContrast> =
    createAction(Event.SET_IMAGE_CONTRAST_REQUESTED);

export const invertColors:
  () => Action<Payloads.invertColors> =
    createAction(Event.INVERT_IMAGE_REQUESTED);

export const resetWorkspace:
  () => Action<Payloads.resetWorkspace> =
    createAction(Event.RESET_WORKSPACE_REQUESTED);

export const canvasResized:
  (rect: Payloads.updateCanvasSize) => Action<Payloads.updateCanvasSize> =
    createAction(
      Event.CANVAS_RESIZED,
    );

export const setMousePosition:
  (position: Payloads.updateMousePosition) => Action<Payloads.updateCanvasSize> =
    createAction(
      Event.MOUSE_POSITION_CHANGED,
    );

export const setAnalysis:
  (id: string) => Action<Payloads.analysisLoadRequested> =
    createAction(Event.SET_ANALYSIS_REQUESTED);

export const showAnalysisResults:
  () => Action<Payloads.showAnalysisResults> =
    createAction(Event.SHOW_ANALYSIS_RESULTS_REQUESTED);

export const hideAnalysisResults:
  () => Action<Payloads.hideAnalysisResults> =
    createAction(Event.CLOSE_ANALYSIS_RESULTS_REQUESTED);

export const highlightStep:
  (symbol: string) => Action<Payloads.highlightStep> =
    createAction(Event.HIGHLIGHT_STEP_ON_CANVAS_REQUESTED);

export const unhighlightStep:
  () => Action<Payloads.unhighlightStep> =
    createAction(Event.UNHIGHLIGHT_STEP_ON_CANVAS_REQUESTED);

export const redo: () => Action<Payloads.undo> = createAction(Event.REDO_REQUESTED);
export const undo: () => Action<Payloads.redo> = createAction(Event.UNDO_REQUESTED);

export const addWorker:
  (details: Payloads.addWorker) => Action<Payloads.addWorker> =
    createAction(Event.WORKER_CREATED);

export const updateWorker:
  (details: Payloads.updateWorkerStatus) => Action<Payloads.updateWorkerStatus> =
    createAction(Event.WORKER_STATUS_CHANGED);

export const removeWorker:
  (details: Payloads.removeWorker) => Action<Payloads.removeWorker> =
    createAction(Event.WORKER_TERMINATED);
