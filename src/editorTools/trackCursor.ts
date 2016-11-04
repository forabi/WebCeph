import {
  setMousePosition,
} from 'actions/workspace';

export const createTrackCursor: EditorToolCreator = (
  _: GenericState,
  dispatch: DispatchFunction,
) => (
  {
    onCanvasMouseMove(x, y) {
      dispatch(setMousePosition({ x, y }));
    },
    shouldShowLens: true,
  }
);

export default createTrackCursor;
