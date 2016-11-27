import { Ls, Li, softPog } from 'analyses/landmarks/points/soft';
import { FH_PLANE } from 'analyses/landmarks/lines/skeletal';
import { line, flipVector, angleBetweenLines } from 'analyses/helpers';

import assign from 'lodash/assign';

/**
 * A profile line is established by drawing a line tangent
 * to Pog' and to the most anterior point of either the
 * lower or upper lip, whichever is most protrusive.
 * 
 * The angle formed by the intersection of FH and this
 * profile line is called the Z-angle.
 */
export const Z: BaseCephaloLandmark = {
  symbol: 'Z',
  type: 'angle',
  name: 'Merrifield\'s Z Angle',
  unit: 'degree',
  components: [FH_PLANE, Li, Ls, softPog],
  map: (
    mapper: CephaloMapper,
    FH: GeometricalVector,
    Li: GeometricalPoint,
    Ls: GeometricalPoint,
    softPog: GeometricalPoint,
  ): GeometricalAngle => {
    const LsSoftPog: GeometricalVector = {
      x1: Ls.x,
      y1: Ls.y,
      x2: softPog.x,
      y2: softPog.y, 
    };
    if (mapper.isBehind(Li, LsSoftPog)) {
      return {
        vectors: [FH, LsSoftPog],
      };
    } else {
      const LiSoftPog: GeometricalVector = {
        x1: Li.x,
        y1: Li.y,
        x2: softPog.x,
        y2: softPog.y, 
      };
      return {
        vectors: [FH, LiSoftPog],
      };
    }
  },
};
