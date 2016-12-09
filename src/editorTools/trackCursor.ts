import {
  setMousePosition,
} from 'actions/workspace';

export const createTrackCursor: EditorToolCreator = (
  _: StoreState,
) => (
  {
    onCanvasMouseMove(dispatch, x, y) {
      dispatch(setMousePosition({ x, y }));
    },
    shouldShowLens: true,
  }
);

export default createTrackCursor;
