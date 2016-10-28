import assign from 'lodash/assign';
import scale, { getScale, getScaleOrigin } from './scale';
import canvasSize, { getCanvasSize } from './canvasSize';
import activeTool, { getActiveToolId, createActiveTool } from './activeTool';
import highlightedStep, { getHighlightedLandmarks } from './highlightedStep';

export default assign(
  { }, 
  canvasSize,
  highlightedStep,
  activeTool,
  scale,
);

export {
  getCanvasSize,
  getScale,
  getScaleOrigin,
  getActiveToolId,
  createActiveTool,
  getHighlightedLandmarks,
};