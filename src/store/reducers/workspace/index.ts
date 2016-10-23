import assign from 'lodash/assign';
import canvas from './canvas';
import image, { getImageSize } from './image';
import workers from './workers';

export default assign(
  { }, 
  image,
  canvas,
  workers,
);

export { getCanvasSize, getImageSize };