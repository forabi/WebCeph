import assign from 'lodash/assign';
import manualLandmarks from './manualLandmarks';
import canvas from './canvas';

export default assign({ }, canvas, manualLandmarks);
