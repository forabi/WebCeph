import assign from 'lodash/assign';
import canvas from './canvas';
import image, { hasImage } from './image';
import workers from './workers';
import analysis from './analysis';

export default assign(
  { }, 
  image,
  canvas,
  workers,
  analysis,
);

export const canUndo = ({ past }: EnhancedState<GenericState>) => past.length > 0;
export const canRedo = ({ future }: EnhancedState<GenericState>) => future.length > 0;
export const canEdit = hasImage;
