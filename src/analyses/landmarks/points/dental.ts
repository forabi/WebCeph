import { point } from 'analyses/helpers';

import { createVectorFromPoints, getMidpoint } from 'utils/math';

/**
 * Midpoint of line connecting the cusps of the premolars
 */
export const centerOfPremolarCusps: CephPoint = {
  ...point('C4', 'Center of premolar cusps'),
  components: [
    point('U4', 'Cusp of upper first premolar'),
    point('L4', 'Cusp of lower first premolar'),
  ],
  map: (U4: GeoPoint, L4: GeoPoint) => {
    return getMidpoint(createVectorFromPoints(U4, L4));
  },
};

/**
 * Midpoint of line connecting the cusps of the premolars
 */
export const centerOfMolarCusps: CephPoint = {
  ...point('C6', 'Center of molar cusps'),
  components: [
    point('U6', 'Cusp of upper first molar'),
    point('L6', 'Cusp of lower first molar'),
  ],
  map: (U6: GeoPoint, L6: GeoPoint) => {
    return getMidpoint(createVectorFromPoints(U6, L6));
  },
};
