import createZoomWithWheel from './zoomWithWheel';
import { Cursor } from 'utils/constants';

export const createZoomWithClick: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => ({
  ...createZoomWithWheel(state, dispatch),
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
});

export default createZoomWithClick;
