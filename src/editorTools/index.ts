import createAddPoint from './addPoint';
import createEraser from './eraser';
import createSelect from './select';
import createZoomWithClick from './zoomWithClick';
import createZoomWithWheel from './zoomWithWheel';

/**
 * A map of user-facing tools only.
 * Does not include tools intended for internal use, i.e. composable tools.
 */
 const ToolsById: Record<ToolId, EditorToolCreator> = {
  SELECT: createSelect,
  ERASER: createEraser,
  ADD_POINT: createAddPoint,
  ZOOM_WITH_CLICK: createZoomWithClick,
  ZOOM_WITH_WHEEL: createZoomWithWheel,
};

export default ToolsById;
