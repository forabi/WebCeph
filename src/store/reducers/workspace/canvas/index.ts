import { createSelector } from 'reselect';

import scale, { getScale, getScaleOrigin } from './scale';
import canvasSize, { getCanvasSize } from './canvasSize';
import canvasPosition, { getCanvasPosition } from './canvasPosition';
import mousePosition, { getMousePosition } from './mousePosition';
import activeTool, { getActiveToolId, getActiveToolCreator } from './activeTool';
import highlightedStep, { getHighlightedStep } from './highlightedStep';

export default {
  ...canvasSize,
  ...canvasPosition,
  ...mousePosition,
  ...highlightedStep,
  ...activeTool,
  ...scale,
};

export {
  getCanvasSize,
  getCanvasPosition,
  getMousePosition,
  getScale,
  getScaleOrigin,
  getActiveToolId,
  getActiveToolCreator,
  getHighlightedStep,
};

const getLensScale = () => 1;

export const shouldShowLens = createSelector(
  getLensScale, // @TODO
  getScale,
  (lensScale, scale) => lensScale - scale > 0.1,
);
