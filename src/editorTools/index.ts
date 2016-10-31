import createAddPoint from './addPoint';
import createEraser from './eraser';
import createSelect from './select';
import createZoomWithClick from './zoomWithClick';

export const ToolsIds = {
  ADD_POINT: 'ADD_POINT',
  ERASER: 'ERASER',
  SELECT: 'SELECT',
  ZOOM_WITH_CLICK: 'ZOOM_WITH_CLICK',
};

/**
 * A map of user-facing tools only.
 * Does not include tools intended for internal use, i.e. composable tools.
 */
 const ToolsById: { [id: string]: EditorToolCreator } = {
  [ToolsIds.SELECT]: createSelect,
  [ToolsIds.ERASER]: createEraser,
  [ToolsIds.ADD_POINT]: createAddPoint,
  [ToolsIds.ZOOM_WITH_CLICK]: createZoomWithClick,
};

export default ToolsById;
