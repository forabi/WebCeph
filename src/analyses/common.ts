import { angleBetweenPoints, line } from './helpers';

/**
 * Frankfort Horizontal Plane
 * Po-Or line projected to form a plane
 */
export const FH_PLANE = line('Po', 'Or');

/**
 * A line connecting sella to nasion
 */
export const SELLA_NASION_LINE = line('S' , 'N');


export default [
  {
    measurment: angleBetweenPoints('S', 'N', 'A'),
    norm: 82,
  },
  {
    measurment: angleBetweenPoints('S', 'N', 'B'),
    norm: 80,
  },
  {
    measurment: angleBetweenPoints('A', 'N', 'B'),
    norm: 2,
  }
]