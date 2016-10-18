import assign from 'lodash/assign';
import manualLandmarks from './manualLandmarks';
import highlightedSteps from './highlightedSteps';
import zoom from './zoom';
import cursorStack from './cursorStack';
import activeTool from './activeTool';
import canvasSize from './canvasSize';
import image from './image';

export default assign(
  { }, 
  image,
  canvasSize,
  manualLandmarks,
  highlightedSteps,
  cursorStack,
  activeTool,
  zoom,
);
