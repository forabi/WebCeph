import createTrackCursor from './trackCursor';

import { setScale } from 'actions/workspace';
import { getScale } from 'store/reducers/workspace/canvas/scale';

import clamp from 'lodash/clamp';
import assign from 'lodash/assign';

const zoomIntensity = 0.2;

const createZoomWithWheel: EditorToolCreator = (
  state: GenericState,
) => assign(
  createTrackCursor(state),
  {
    onCanvasMouseEnter() {
      // @TODO
    },
    onCanvasMouseLeave() {
      // @TODO
    },
    
    onCanvasMouseWheel: (dispatch, x, y, delta) => {
      console.log('triggering zoom at', x, y);
      const wheel = delta / 120;
      const zoom = Math.exp(-wheel * zoomIntensity);
      const scale = getScale(state);
      const newScale = clamp(scale * zoom, 0.2, 2);
      if (newScale !== scale) {
        dispatch(setScale(newScale, x, y));
      }
    },

    shouldShowLens: false,
  } as EditorTool,
);

export default createZoomWithWheel;
