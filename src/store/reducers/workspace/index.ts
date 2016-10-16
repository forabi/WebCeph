import assign from 'lodash/assign';
import manualLandmarks from './manualLandmarks';
import highlightedSteps from './highlightedSteps';
import zoom from './zoom';

export default assign({ }, highlightedSteps, zoom, manualLandmarks);
