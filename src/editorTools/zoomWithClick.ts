import createZoomWithWheel from './zoomWithWheel';
import { Cursor } from 'utils/constants';

import { getScale } from 'store/reducers/workspace/canvas/scale';

import { setScale } from 'actions/workspace';

import assign from 'lodash/assign';

export const createZoomWithClick: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => (assign(
  createZoomWithWheel(state, dispatch),
  {
    onCanvasLeftClick(x, y) {
      dispatch(setScale(getScale(state) * 1.2, x, y));
    },
    onCanvasRightClick(x, y) {
      dispatch(setScale(getScale(state) * 0.8, x, y));
    },
    getCursorForCanvas() {
      return Cursor.ZOOM;
    },
    shouldShowLens: false,
  } as EditorTool,
));

export default createZoomWithClick;
