import createZoomWithWheel from './zoomWithWheel';
import { highlightStep, unhighlightStep } from 'actions/workspace';
import { Cursor } from 'utils/constants';

export const createSelect: EditorToolCreator = (
  state: StoreState,
) => ({
  ...createZoomWithWheel(state),
  getCursorForLandmark() {
    return Cursor.SELECT;
  },
  onLandmarkMouseEnter(dispatch, symbol) {
    dispatch(highlightStep(symbol));
    // @TODO: show tooltip?
  },
  onLandmarkMouseLeave(dispatch) {
    dispatch(unhighlightStep());
    // @TODO: hide tooltip
  },
  shouldShowLens: true,
});

export default createSelect;
