import has from 'lodash/has';
import assign from 'lodash/assign';

import { angleBetweenPoints, line, angleBetweenLines } from './helpers';
import common, { components as commonComponents, FH_PLANE, N, Pog, A, B, Gn, S, Po } from './common';
import { radiansToDegrees, calculateAngleBetweenPoints, isBehind } from '../utils/math';

export const ANGLE_OF_CONVEXITY: BaseCephaloLandmark = assign(
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
)

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
    if (has(values, ANGLE_OF_CONVEXITY.symbol)) {
      const value = values[ANGLE_OF_CONVEXITY.symbol] as number;
      if (value < -5) {
        results.push(AnalysisResult.CONCAVE_SKELETAL_PROFILE);
      } else if (value > 5) {
        results.push(AnalysisResult.CONVEX_SKELETAL_PROFILE);
      } else {
        results.push(AnalysisResult.NORMAL_SKELETAL_PROFILE);
      }
    }
    return results;
  }
}

export default analysis;