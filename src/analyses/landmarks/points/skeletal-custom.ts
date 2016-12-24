import { point } from 'analyses/helpers';
import { Pt, R1, R2, R3, R4 } from './skeletal';
import { FH, PtV, cranialBase, facialAxis } from 'analyses/landmarks/lines/skeletal';
import { getIntersectionPoint, createPerpendicular, createVectorFromPoints } from 'utils/math';

/**
 * Cephalometric landmark formed by the intersection of FH and
 * the perpendicular through Pt point.
 */
export const CF: CephLandmark = {
  ...point(
    'CF',
    'Center of face',
  ),
  components: [FH, Pt],
  map(geoFH: GeoVector, geoPt: GeoPoint) {
    return getIntersectionPoint(geoFH, createPerpendicular(geoFH, geoPt)) as GeoPoint;
  },
};

/**
 * Cephalometric landmark formed by the intersection of the two lines Ba-N and Pt-Gn.
 */
export const CC: CephLandmark = {
  ...point(
    'CC',
    'Center of cranium',
  ),
  components: [cranialBase, facialAxis],
  map(geoCranialBase: GeoVector, geoFacialAxis: GeoVector) {
    return getIntersectionPoint(geoCranialBase, geoFacialAxis) as GeoPoint;
  },
};

/**
 * A point located at the geometric center of the ramus.
 */
export const Xi: CephPoint = {
  ...point(
    'Xi',
    'Center of ramus',
  ),
  components: [R1, R2, R3, R4, FH, PtV],
  /**
   * Location of Xi is keyed geometrically to Po-Or (FH) and perpendicular through Pt
   * (pterygoid vertical [PtV]; a line perpendicular to FH at the posterior margin of
   * the pterygopalatine fossa).
   */
  map(
    geoR1: GeoPoint, geoR2: GeoPoint,
    geoR3: GeoPoint, geoR4: GeoPoint,
    geoFH: GeoVector, geoPtV: GeoVector,
  ) {
    // Planes perpendicular to FH and PtV are constructed.
    const i1 = createPerpendicular(geoFH, geoR1);
    const i2 = createPerpendicular(geoFH, geoR2);
    const i3 = createPerpendicular(geoPtV, geoR3);
    const i4 = createPerpendicular(geoPtV, geoR4);

    // Xi is located in the center of the rectangle at the intersection of the diagonals.
    const diag1 = createVectorFromPoints(
      getIntersectionPoint(i3, i1) as GeoPoint,
      getIntersectionPoint(i4, i2) as GeoPoint,
    );
    const diag2 = createVectorFromPoints(
      getIntersectionPoint(i3, i2) as GeoPoint,
      getIntersectionPoint(i4, i1) as GeoPoint,
    );
    return getIntersectionPoint(diag1, diag2) as GeoPoint;
  },
};
