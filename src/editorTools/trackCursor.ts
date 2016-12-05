import {
  setMousePosition,
} from 'actions/workspace';

export const createTrackCursor: EditorToolCreator = (
  _: GenericState,
) => (
  {
    onCanvasMouseMove(dispatch, x, y) {
      dispatch(setMousePosition({ x, y }));
    },
    shouldShowLens: true,
  }
);

export default createTrackCursor;
