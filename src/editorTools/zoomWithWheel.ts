import { setScale } from 'actions/workspace';
import { getScale } from 'store/reducers/workspace/canvas/scale';
import clamp from 'lodash/clamp';

const createZoomWithWheel: EditorToolCreator = (
  state: GenericState,
  dispatch: DispatchFunction,
) => ({
  onCanvasMouseEnter() {
    // @TODO
  },
  onCanvasMouseLeave() {
    // @TODO
  },
  onCanvasMouseWheel(x, y, delta) {
    console.log('delta', delta);
    const newScale = clamp(getScale(state) * (delta > 0 ? 1.1 : 0.9), 0.5, 4);
    dispatch(setScale(newScale, x, y));
  },
  shouldShowLens: false,
});

export default createZoomWithWheel;
