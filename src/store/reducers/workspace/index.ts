import assign from 'lodash/assign';
import manualLandmarks from './manualLandmarks';
import highlightedSteps from './highlightedSteps';
import scale from './scale';
import cursorStack from './cursorStack';
import activeTool from './activeTool';
import canvasSize, { getCanvasSize } from './canvasSize';
import image, { getImageSize } from './image';

export default assign(
  { }, 
  image,
  canvasSize,
  manualLandmarks,
  highlightedSteps,
  cursorStack,
  activeTool,
  scale,
);

export { getCanvasSize, getImageSize };