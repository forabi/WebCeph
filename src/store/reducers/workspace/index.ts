import assign from 'lodash/assign';
import manualLandmarks from './manualLandmarks';
import highlightedSteps from './highlightedSteps';
import zoom from './zoom';
import cursorStack from './cursorStack';
import activeTools from './activeTools';

export default assign({ }, highlightedSteps, zoom, manualLandmarks, cursorStack, activeTools);
