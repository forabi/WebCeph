import createSelect from './select';
import Eraser from './eraser';
import AddPoint from './addPoint';
import createZoomWithClick from './zoomWithClick';

export const ToolsIds = {
  SELECT: 'SELECT',
  ERASER: 'ERASER',
  ADD_POINT: 'ADD_POINT',
  ZOOM_WITH_CLICK: 'ZOOM_WITH_CLICK',
};

/**
 * A map of user-facing tools only.
 * Does not include tools intended for internal use, i.e. composable tools.
 */
 const ToolsById: { [id: string]: EditorToolCreator } = {
  [ToolsIds.SELECT]: createSelect,
  [ToolsIds.ERASER]: Eraser,
  [ToolsIds.ADD_POINT]: AddPoint,
  [ToolsIds.ZOOM_WITH_CLICK]: createZoomWithClick,
};

export default ToolsById;
