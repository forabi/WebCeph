import createZoomWithWheel from './zoomWithWheel';
import { highlightStep, unhighlightStep } from 'actions/workspace';
import { Cursor } from 'utils/constants';

import assign from 'lodash/assign';

export const createSelect: EditorToolCreator = (
  state: GenericState,
) => {
  return assign(
    createZoomWithWheel(state),
    {
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
    } as EditorTool,
  ) as EditorTool;
};

export default createSelect;
