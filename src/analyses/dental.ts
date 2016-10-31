import {
  LowerIncisorInclination,
  ProblemSeverity,
  UpperIncisorInclination,
  angleBetweenLines, flipVector, line, point,
} from './helpers';

import { Go, Me, N, S } from './common';

const U1_APEX = point('U1 Apex', undefined, 'Apex of Upper Incisor');
const U1_INCISAL_EDGE = point('U1 Incisal Edge', undefined, 'Incisal Edge of Upper Incisor');

const L1_APEX = point('L1 Apex', undefined, 'Apex of Lower Incisor');
const L1_INCISAL_EDGE = point('L1 Incisal Edge', undefined, 'Incisal Edge of Lower Incisor');

/**
 * A line connecting the incisal edge and root apex of the most prominent maxillary incisor
 */
const U1_AXIS = line(U1_APEX, U1_INCISAL_EDGE, 'Upper Incisor Axis', 'U1');

/**
 * Angle between the upper incisor to S-N line
 */
const U1_SN = angleBetweenLines(line(N, S), U1_AXIS, undefined, 'U1-SN');

/**
 * Axis of lower incisor.
 * A line connecting the apex of the lower incisor with its incisal edge
 */
const L1_AXIS = line(L1_APEX, L1_INCISAL_EDGE, 'Lower Incisor Axis', 'L1');

/**
 * Incisor Mandibular Plane Angle
 * Angle between the lower incisor to the mandibular plane
 */
const L1_MP = angleBetweenLines(line(Me, Go), L1_AXIS, 'Incisor Mandibular Plane Angle', 'IMPA');

const INTERINCISAL_ANGLE: CephaloAngle = angleBetweenLines(
  flipVector(U1_AXIS),
  flipVector(L1_AXIS),
  'Interincisal Angle',
  'U1-L1'
);

const angleBetweenUpperIncisorToSN: AnalysisComponent = {
  landmark: U1_SN,
  norm: 102,
  stdDev: 5,
};

const angleBetweenLowerIncisorToMP: AnalysisComponent = {
  landmark: L1_MP,
  norm: 90,
  stdDev: 3,
};


const interincisalAngle: AnalysisComponent = {
  landmark: INTERINCISAL_ANGLE,
  norm: 130,
  stdDev: 5,
};

const analysis: Analysis = {
  id: 'basic',
  components: [
    interincisalAngle,
    angleBetweenUpperIncisorToSN,
    angleBetweenLowerIncisorToMP,
  ],
  interpret(values) {
    const results: AnalysisInterpretation[] = [];
    if (values[INTERINCISAL_ANGLE.symbol] !== undefined) {
      // @TODO
    }


    const valueOfL1_MP = values[L1_MP.symbol];
    if (typeof values[L1_MP.symbol] === 'number') {
      let severity = ProblemSeverity.NONE;
      let indication = LowerIncisorInclination.normal;
      const { norm, stdDev } = angleBetweenLowerIncisorToMP;
      if (valueOfL1_MP < norm - stdDev) {
        indication = LowerIncisorInclination.lingual;
      } else if (valueOfL1_MP > norm + stdDev) {
        indication = LowerIncisorInclination.labial;
      }
      results.push({
        indication,
        severity,
        relevantComponents: [L1_MP.symbol],
      });
    }


    const valueOfU1_SN = values[U1_SN.symbol];
    if (typeof valueOfU1_SN === 'number') {
      let severity = ProblemSeverity.NONE;
      let indication = UpperIncisorInclination.normal;
      const { norm, stdDev } = angleBetweenUpperIncisorToSN;
      if (valueOfU1_SN < norm - stdDev) {
        indication = UpperIncisorInclination.palatal;
      } else if (valueOfU1_SN > norm + stdDev) {
        indication = UpperIncisorInclination.labial;
      }
      results.push({
        indication,
        severity,
        relevantComponents: [U1_SN.symbol],
      });
    }

    const valueOfInterincisalAngle = values[INTERINCISAL_ANGLE.symbol];
    if (typeof valueOfInterincisalAngle === 'number') {

    }
    return results;
  },
};

export default analysis;
