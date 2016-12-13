import { distance, defaultInterpetLandmark } from 'analyses/helpers';

import {
  L1_INCISAL_EDGE, U1_INCISAL_EDGE,
} from 'analyses/landmarks/points/skeletal';

import {
  functionalOcclusalPlane,
} from 'analyses/landmarks/lines/dental';

import {
  createPerpendicular,
  createVectorFromPoints,
  getIntersectionPoint,
  getSegmentLength,
} from 'utils/math';

export const overjet: CephLandmark = {
  type: 'distance',
  symbol: 'overjet',
  unit: 'mm',
  components: [functionalOcclusalPlane, U1_INCISAL_EDGE, L1_INCISAL_EDGE],
  map: (occlusalPlane: GeoVector, u1Tip: GeoPoint, l1Tip: GeoPoint) => {
    const p1 = createPerpendicular(occlusalPlane, u1Tip);
    const p2 = createPerpendicular(occlusalPlane, l1Tip);
    const point1 = getIntersectionPoint(occlusalPlane, p1) as GeoPoint;
    const point2 = getIntersectionPoint(occlusalPlane, p2) as GeoPoint;
    return createVectorFromPoints(point1, point2);
  },
  calculate: () => () => (segment: GeoVector) => {
    return getSegmentLength(segment);
  },
  interpret(value, min, max, mean): Array<LandmarkInterpretation<'overjet'>> {
    if (value < 0) {
      return [{
        category: 'overjet',
        indication: 'negative',
        max, min, mean, value,
      }];
    }
    return defaultInterpetLandmark(
      'overjet',
      ['decreased', 'normal', 'increased'],
    )(value, min, max, mean);
  }
};

export const overbite: CephLandmark = {
  type: 'distance',
  symbol: 'overbite',
  unit: 'mm',
  components: [
    distance(L1_INCISAL_EDGE, functionalOcclusalPlane),
    distance(U1_INCISAL_EDGE, functionalOcclusalPlane),
  ],
  calculate: (l1Distance: number, u1Distance: number) => () => () => {
    return u1Distance - l1Distance;
  },
  interpret(value, min, max, mean): Array<LandmarkInterpretation<'overbite'>> {
    if (value < 0) {
      return [{
        category: 'overbite',
        indication: 'negative',
        max, min, mean, value,
      }];
    }
    return defaultInterpetLandmark(
      'overbite',
      ['decreased', 'normal', 'increased'],
    )(value, min, max, mean);
  }
};
