import { Ls, Li, softPog } from 'analyses/landmarks/points/soft';
import { FH } from 'analyses/landmarks/lines/skeletal';
import { flipVector } from 'analyses/helpers';
import { isBehind, createVectorFromPoints } from 'utils/math';

/**
 * A profile line is established by drawing a line tangent
 * to Pog' and to the most anterior point of either the
 * lower or upper lip, whichever is most protrusive.
 * 
 * The angle formed by the intersection of FH and this
 * profile line is called the Z-angle.
 */
export const Z: CephLandmark = {
  symbol: 'Z',
  type: 'angle',
  name: 'Merrifield\'s Z Angle',
  unit: 'degree',
  imageTypes: ['ceph_lateral'],
  components: [flipVector(FH), Li, Ls, softPog],
  map: (
    FH: GeoVector,
    Li: GeoPoint,
    Ls: GeoPoint,
    softPog: GeoPoint,
  ): GeoAngle => {
    const LsSoftPog = createVectorFromPoints(Ls, softPog);
    if (isBehind(Li, LsSoftPog)) {
      return {
        vectors: [FH, LsSoftPog],
      };
    } else {
      const LiSoftPog = createVectorFromPoints(Li, softPog);
      return {
        vectors: [FH, LiSoftPog],
      };
    }
  },
};
