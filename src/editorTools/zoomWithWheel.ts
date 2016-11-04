const createZoomWithWheel: EditorToolCreator = (
  _: GenericState,
  dispatch: DispatchFunction,
) => ({
  onCanvasMouseEnter() {
    // @TODO
  },
  onCanvasMouseLeave() {
    // @TODO
  },
  onCanvasMouseWheel(x, y, delta) {
    // @TODO
  },
  shouldShowLens: false,
});

export default createZoomWithWheel;
