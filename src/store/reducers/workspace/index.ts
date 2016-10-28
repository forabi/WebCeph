import assign from 'lodash/assign';
import canvas from './canvas';
import image from './image';
import workers from './workers';
import analysis from './analysis';

export default assign(
  { }, 
  image,
  canvas,
  workers,
  analysis,
);
