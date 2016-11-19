import createZoomWithWheel from './zoomWithWheel';
import { highlightStep, unhighlightStep } from 'actions/workspace';
import { Cursor } from 'utils/constants';

export const createSelect: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => ({
  ...createZoomWithWheel(state, dispatch),
  getCursorForLandmark() {
    return Cursor.SELECT;
  },
  onLandmarkMouseEnter(symbol) {
    dispatch(highlightStep(symbol));
    // @TODO: show tooltip?
  },
  onLandmarkMouseLeave(_) {
    dispatch(unhighlightStep());
    // @TODO: hide tooltip
  },
  shouldShowLens: true,
});

export default createSelect;
