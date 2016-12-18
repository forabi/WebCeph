import createZoomWithWheel from './zoomWithWheel';
import { Cursor } from 'utils/constants';

import { getScale } from 'store/reducers/workspace/canvas';
import { getActiveImageId } from 'store/reducers/workspace/image';

import { setScale } from 'actions/workspace';

export const createZoomWithClick: EditorToolCreator = (
  state: StoreState,
) => ({
  ...createZoomWithWheel(state),
  onCanvasLeftClick(dispatch, x, y) {
    dispatch(setScale({
      imageId: getActiveImageId(state),
      scale: getScale(state) * 1.2,
    }));
  },
  onCanvasRightClick(dispatch, x, y) {
    dispatch(setScale({
      imageId: getActiveImageId(state),
      scale: getScale(state) * 0.8,
    }));
  },
  getCursorForCanvas() {
    return Cursor.ZOOM;
  },
  shouldShowLens: false,
});

export default createZoomWithClick;
