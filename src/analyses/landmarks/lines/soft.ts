import { line } from 'analyses/helpers';

import {
  Pn, softPog,
} from 'analyses/landmarks/points/soft';

/**
 * The E-line (esthetic line of Ricketts)
 */
export const FH_PLANE = line(Pn, softPog, undefined, 'E-line');
