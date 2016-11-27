import { S, N, A, B, Ar, Go, Me, Gn } from 'analyses/landmarks/points';
import { FH_PLANE, SELLA_NASION_LINE, MP, SPP, U1_AXIS, L1_AXIS } from 'analyses/landmarks/lines';
import { line, angleBetweenLines, angleBetweenPoints } from 'analyses/helpers';
import { radiansToDegrees, calculateAngleBetweenTwoVectors } from 'utils/math';

import assign from 'lodash/assign';

/**
 * SNA (sella, nasion, A point) indicates whether or not the maxilla is normal, prognathic, or retrognathic.
 */
export const SNA = angleBetweenPoints(S, N, A);

/**
 * SNB (sella, nasion, B point) indicates whether or not the mandible is normal, prognathic, or retrognathic.
 */
export const SNB = angleBetweenPoints(S, N, B);

/**
 * ANB (A point, nasion, B point) indicates whether the skeletal relationship between
 * the maxilla and mandible is a normal skeletal class I (+2 degrees),
 * a skeletal Class II (+4 degrees or more), or skeletal class III (0 or negative) relationship.
 * ANB is a custom landmark that has a positive sign if A is in front of N-B, negative otherwise.
 */
export const ANB: CephaloAngle = assign(
  angleBetweenLines(line(N, A), line(N, B)),
  {
    calculate(mapper: CephaloMapper, lineNA: GeometricalVector, lineNB: GeometricalVector) {
      const _A = { x: lineNA.x2, y: lineNA.y2 };
      const positiveValue = Math.abs(radiansToDegrees(calculateAngleBetweenTwoVectors(lineNA, lineNB)));
      if (mapper.isBehind(_A, lineNB)) {
        return -1 * positiveValue;
      }
      return positiveValue;
    },
  },
);

/**
 * Angle between Frankfort horizontal line and the line intersecting Gonion-Menton
 */
export const FMPA: CephaloAngle = angleBetweenLines(
  FH_PLANE, MP,
  'Frankfort Mandibular Plane Angle',
  'FMPA'
);

/**
 * Angle between Frankfort horizontal line and the line intersecting Gonion-Menton
 */
export const FMA = FMPA;

/**
 * Angle between SN and the mandibular plane
 */
export const SN_MP: CephaloAngle = angleBetweenLines(
  SELLA_NASION_LINE, MP,
  'SN-MP',
  'SN-MP'
);

/**
 * Saddle Angle
 */
export const NSAr = angleBetweenPoints(N, S, Ar, 'Saddle Angle');

/**
 * Articular Angle
 */
export const SArGo = angleBetweenPoints(S, Ar, Go, 'Articular Angle');

/**
 * Gonial Angle
 */
export const ArGoMe = angleBetweenPoints(Ar, Go, Me, 'Gonial Angle');

/**
 * 
 */
export const MM = angleBetweenLines(SPP, MP, undefined, 'MM');

/**
 * Angle between the upper incisor to S-N line
 */
export const U1_SN = angleBetweenLines(line(N, S), U1_AXIS, undefined, 'U1-SN');

/**
 * Incisor Mandibular Plane Angle
 * Angle between the lower incisor to the mandibular plane
 */
export const L1_MP = angleBetweenLines(
  line(Me, Go), L1_AXIS,
  'Incisor Mandibular Plane Angle',
  'IMPA',
);

export const ANGLE_OF_Y_AXIS = angleBetweenLines(
  line(S, Gn, 'Y Axis'),
  FH_PLANE,
  'Y Axis-FH Angle',
  'Y-FH Angle'
);
