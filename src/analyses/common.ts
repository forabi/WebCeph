import { angleBetweenPoints, line, Analysis } from './helpers';

/**
 * Frankfort Horizontal Plane
 * Po-Or line projected to form a plane
 */
export const FH_PLANE = line('Po', 'Or');

/**
 * A line connecting sella to nasion
 */
export const SELLA_NASION_LINE = line('S' , 'N');


export default <Analysis>[
  {
    measurement: angleBetweenPoints('S', 'N', 'A'),
    norm: 82,
  },
  {
    measurement: angleBetweenPoints('S', 'N', 'B'),
    norm: 80,
  },
  {
    measurement: angleBetweenPoints('A', 'N', 'B'),
    norm: 2,
  }
]