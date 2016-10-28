import assign from 'lodash/assign';
import createZoomWithWheel from './zoomWithWheel';
import { Cursor } from 'utils/constants';

export const createZoomWithClick: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => (assign(
  createZoomWithWheel(state, dispatch),
  {
    onCanvasLeftClick(x, y) {
      // @TODO
    },
    onCanvasRightClick(x, y) {
      // @TODO
    },
    getCursorForCanvas() {
      return Cursor.ZOOM;
    }
  } as EditorTool,
));

export default createZoomWithClick;
