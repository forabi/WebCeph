import assign from 'lodash/assign';
import manualLandmarks from './manualLandmarks';
import highlightedSteps from './highlightedSteps';
import zoom from './zoom';
import cursorStack from './cursorStack';
import activeTool from './activeTool';

export default assign({ }, highlightedSteps, zoom, manualLandmarks, cursorStack, activeTool);
