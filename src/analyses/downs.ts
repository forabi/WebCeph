import assign from 'lodash/assign';
import {
  angleBetweenPoints,
  line, angleBetweenLines,
  SkeletalProfile, AnalysisResultSeverity,
  MandibularRotation,
} from './helpers';
import common, { components as commonComponents, FH_PLANE, N, Pog, A, B, Gn, S, Po } from './common';
import { radiansToDegrees, calculateAngleBetweenTwoVectors, isBehind } from '../utils/math';

const ANGLE_OF_CONVEXITY: CephaloAngle = assign(
   angleBetweenPoints(N, A, Pog, 'Angle of Convexity'),
   {
     calculate: (NA: GeometricalVector, APog: GeometricalVector) => {
       const _A = { x: NA.x1, y: NA.y1 };
       const _N = { x: NA.x2, y: NA.y2 };
       const _Pog = { x: APog.x2, y: APog.y2 };
       const _NPog = { x1: _N.x, y1: _N.y, x2: _Pog.x, y2: _Pog.y }
       const positiveValue = radiansToDegrees(Math.PI - calculateAngleBetweenTwoVectors(NA, APog));
       if (isBehind(_A, _NPog)) {
         return -1 * positiveValue;
       } else {
         return positiveValue;
       }
     }
   },
);

const ANGLE_OF_Y_AXIS = angleBetweenLines(line(S, Gn, 'Y Axis'), FH_PLANE, 'Y Axis-FH Angle', 'Y-FH Angle');

const interpretAngleOfConvexity = (value: number, min = -5, max = 5): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [ANGLE_OF_CONVEXITY.symbol];
  let severity = AnalysisResultSeverity.NONE;
  let type = SkeletalProfile.normal;
  if (value < min) {
    type = SkeletalProfile.concave;
    severity = Math.max(
      AnalysisResultSeverity.HIGH,
      Math.round(Math.abs(value - min) / 3),
    );
  } else if (value > max) {
    type = SkeletalProfile.convex;
    severity = Math.min(
      AnalysisResultSeverity.HIGH,
      Math.round(Math.abs(value - max) / 3),
    );
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

const interpretAngleOfYAxis = (value: number, min = -55.6, max = 63.2): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [ANGLE_OF_Y_AXIS.symbol];
  let severity = AnalysisResultSeverity.NONE;
  let indication = MandibularRotation.normal;
  if (value < min) {
    indication = MandibularRotation.counterClockwise;
    severity = Math.max(
      AnalysisResultSeverity.HIGH,
      Math.round(Math.abs(value - min) / 3),
    );
  } else if (value > max) {
    indication = MandibularRotation.clockwise;
    severity = Math.min(
      AnalysisResultSeverity.HIGH,
      Math.round(Math.abs(value - max) / 3),
    );
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

export const angleOfConvexity: AnalysisComponent = {
  landmark: ANGLE_OF_CONVEXITY,
  norm: 0,
  stdDev: 5.1,
};

export const angleOfYAxis: AnalysisComponent = {
  landmark: ANGLE_OF_Y_AXIS,
  norm: 59.4,
  stdDev: 3.8,
};

const components: AnalysisComponent[] = [
  ...commonComponents,
  angleOfConvexity,
  angleOfYAxis,
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
  if (values[ANGLE_OF_CONVEXITY.symbol] !== undefined) {
    results.push(
      interpretAngleOfConvexity(values[ANGLE_OF_CONVEXITY.symbol] as number),
    );
  }
  if (values[ANGLE_OF_Y_AXIS.symbol] !== undefined) {
    results.push(
      interpretAngleOfYAxis(values[ANGLE_OF_Y_AXIS.symbol] as number),
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