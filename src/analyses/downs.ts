import assign from 'lodash/assign';

import { angleBetweenPoints, line, angleBetweenLines, SkeletalProfile, AnalysisResultSeverity } from './helpers';
import common, { components as commonComponents, FH_PLANE, N, Pog, A, B, Gn, S, Po } from './common';
import { radiansToDegrees, calculateAngleBetweenPoints, isBehind } from '../utils/math';

const ANGLE_OF_CONVEXITY: CephaloAngle = assign(
   angleBetweenPoints(N, A, Pog, 'Angle of Convexity'),
   {
     calculate: (NA: GeometricalLine, APog: GeometricalLine) => {
       const _N = { x: NA.x1, y: NA.y1 };
       const _A = { x: NA.x2, y: NA.y2 };
       const _Pog = { x: APog.x2, y: APog.y2 };
       const _NPog = { x1: _N.x, y1: _N.y, x2: _Pog.x, y2: _Pog.y }
       const _angle = calculateAngleBetweenPoints(_N, _A, _Pog);
       if (isBehind(_A, _NPog)) {
         return (180 - radiansToDegrees(_angle)) * -1;
       } else {
         return 180 - radiansToDegrees(_angle);
       }
     }
   },
);

const interpretAngleOfConvexity = (value: number, min = -5, max = 5): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [ANGLE_OF_CONVEXITY.symbol];
  let severity = AnalysisResultSeverity.NONE;
  let type = SkeletalProfile.normal;
  if (value < -5) {
    type = SkeletalProfile.concave;
    severity = Math.max(
      AnalysisResultSeverity.HIGH,
      Math.round(Math.abs(value - min) / 3),
    );
  } else if (value > 5) {
    type = SkeletalProfile.convex;
    severity = Math.min(
      AnalysisResultSeverity.HIGH,
      Math.round(Math.abs(value - max) / 3),
    );
  }
  return {
    type,
    severity,
    relevantComponents,
  };
};

export const angleOfConvexity: AnalysisComponent = {
  landmark: ANGLE_OF_CONVEXITY,
  norm: 0,
  stdDev: 5.1,
};

const components: AnalysisComponent[] = [
  ...commonComponents,
  angleOfConvexity,
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

export const interpret = (values: { [id: string]: EvaluatedValue }) => {
  const results: AnalysisResult[] = common.interpret(values);
  // @TODO
  if (values[ANGLE_OF_CONVEXITY.symbol] !== undefined){
    results.push(
      interpretAngleOfConvexity(values[ANGLE_OF_CONVEXITY.symbol] as number),
    );
  }
  return results;
};

const analysis: Analysis = {
  id: 'downs',
  components,
  interpret,
}

export default analysis;