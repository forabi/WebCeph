import { setScale } from 'actions/workspace';
import { getScale } from 'store/reducers/workspace/canvas/scale';

import clamp from 'lodash/clamp';

const zoomIntensity = 0.2;

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
  onCanvasMouseWheel: (x: number, y: number, delta: number) => {
    const wheel = delta / 120;
    const zoom = Math.exp(-wheel * zoomIntensity);
    const scale = getScale(state);
    const newScale = clamp(scale * zoom, 0.2, 2);
    if (newScale !== scale) {
      dispatch(setScale(newScale, x, y));
    }
  },

  shouldShowLens: false,
});

export default createZoomWithWheel;
