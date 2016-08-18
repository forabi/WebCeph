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

export const SNA = angleBetweenPoints('S', 'N', 'A');
export const SNB = angleBetweenPoints('S', 'N', 'B');


export default <Analysis>[
  {
    landmark: SNA,
    norm: 82,
  },
  {
    landmark: SNB,
    norm: 80,
  },
  {
    landmark: {
        name: null,
        type: 'angle',
        symbol: 'ANB',
        components: [SNA, SNB],
        calculate(SNA: number, SNB: number) {
            return SNA - SNB;
        },
    },
    norm: 2,
  }
]