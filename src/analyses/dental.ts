import {
  LowerIncisorInclination,
  ProblemSeverity,
  UpperIncisorInclination,
  angleBetweenLines, flipVector,
} from './helpers';

import { U1_AXIS, L1_AXIS } from 'analyses/landmarks/lines';
import { U1_SN, L1_MP } from 'analyses/landmarks/angles';

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
