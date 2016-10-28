import assign from 'lodash/assign';
import createZoomWithWheel from './zoomWithWheel';
import { highlightStep, unhighlightStep } from 'actions/workspace';
import { Cursor } from 'utils/constants';

export const createSelect: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => {
  return assign(
    createZoomWithWheel(state, dispatch),
    {
      getCursorForLandmark() {
        return Cursor.SELECT;
      },
      onLandmarkMouseEnter(symbol) {
        dispatch(highlightStep(symbol));
        // @TODO: show tooltip?
      },
      onLandmarkClick(symbol) {
        dispatch(unhighlightStep(symbol));
        // @TODO: hide tooltip
      },
    } as EditorTool,
  ) as EditorTool;
};

export default createSelect;
