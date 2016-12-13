import { line } from 'analyses/helpers';

import {
  centerOfMolarCusps, centerOfPremolarCusps,
} from 'analyses/landmarks/points/dental';

/**
 * The functional occlusal plane.
 * A line bisecting the cusp of tips of the molars and passing
 * through the cusp tips of the first premolars.
 */
export const functionalOcclusalPlane: CephLine = line(
  centerOfMolarCusps,
  centerOfPremolarCusps,
  'Functional occlusal plane',
  'OP',
);
