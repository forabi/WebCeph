import assign from 'lodash/assign';
import scale from './scale';
import canvasSize from './canvasSize';
import activeTool from './activeTool';
import highlightedSteps from './highlightedSteps';

export default assign(
  { }, 
  canvasSize,
  highlightedSteps,
  activeTool,
  scale,
);