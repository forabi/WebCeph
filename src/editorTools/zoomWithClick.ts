import createZoomWithWheel from './zoomWithWheel';
import { Cursor } from 'utils/constants';

import assign from 'lodash/assign';

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
    },
    shouldShowLens: false,
  } as EditorTool,
));

export default createZoomWithClick;
