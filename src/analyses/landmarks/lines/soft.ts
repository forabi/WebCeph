import { line } from 'analyses/helpers';

import {
  Pn, softPog,
} from 'analyses/landmarks/points/soft';

/**
 * The E-line (esthetic line of Ricketts)
 */
export const ELine = line(Pn, softPog, undefined, 'E-line');
