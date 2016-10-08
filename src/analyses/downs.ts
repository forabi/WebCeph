import assign from 'lodash/assign';

import { angleBetweenPoints, line, angleBetweenLines, SkeletalProfile, AnalysisResultSeverity } from './helpers';
import common, { components as commonComponents, FH_PLANE, N, Pog, A, B, Gn, S, Po } from './common';
import { radiansToDegrees, calculateAngleBetweenPoints, isBehind } from '../utils/math';

export const ANGLE_OF_CONVEXITY: CephaloAngle = assign(
   angleBetweenPoints(N, A, Pog, 'Angle of Convexity'),
   {
     calculate: (NA: GeometricalLine, APog: GeometricalLine) => {
       const _N = { x: NA.x1, y: NA.y1 };
       const _A = { x: NA.x2, y: NA.y2 };
       const _Pog = { x: APog.x2, y: APog.y2 };
       const _NPog = { x1: _N.x, y1: _N.y, x2: _Pog.x, y2: _Pog.y }
       const _angle = calculateAngleBetweenPoints(_N, _A, _Pog);
       // @FIXME: Downs has different values for NAPog
       if (isBehind(_A, _NPog)) {
         return radiansToDegrees(_angle);
       } else {
         return 360 - radiansToDegrees(_angle);
       }
     }
   },
);

const interpretAngleOfConvexity = (value: number, min = -5, max = 5): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [ANGLE_OF_CONVEXITY.symbol];
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  );
  let type = SkeletalProfile.normal;
  if (value < -5) {
    type = SkeletalProfile.concave;
  } else if (value > 5) {
    type = SkeletalProfile.convex;
  }
  return {
    type,
    severity,
    relevantComponents,
  };
};

const components: AnalysisComponent[] = [
  ...commonComponents,
  {
    landmark: ANGLE_OF_CONVEXITY,
    norm: 87.8,
    stdDev: 5.1,
  },
  {
    landmark: angleBetweenPoints(Gn, S, Po, 'Y Axis'),
    norm: 59.4,
    stdDev: 3.8,
  },
  {
    landmark: angleBetweenLines(line(A, B), line(N, Po), 'A-B Plane Angle'),
    norm: -4.6,
    stdDev: 4.6,
  },
  {
    landmark: angleBetweenLines(FH_PLANE, line(Pog, N), 'Facial Angle', 'FH-NPog'),
    norm: 87.8,
    stdDev: 3.6,
  },
];

const analysis: Analysis = {
  id: 'downs',
  components,
  interpret(values) {
    const results: AnalysisResult[] = common.interpret(values);
    // @TODO
    if (values[ANGLE_OF_CONVEXITY.symbol] !== undefined){
      results.push(
        interpretAngleOfConvexity(values[ANGLE_OF_CONVEXITY.symbol] as number),
      );
    }
    return results;
  }
}

export default analysis;