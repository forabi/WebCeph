import {
  line, point, angleBetweenLines, flipVector,
  UpperIncisorInclination, LowerIncisorInclination,
  AnalysisResultSeverity
} from './helpers';
import { N, S, Me, Go } from './common';

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
const L1_MP = angleBetweenLines(line(Me, Go), L1_AXIS, 'Incisor Mandibular Plane Angle', 'FMIA');

const INTERINCISAL_ANGLE: CephaloAngle = angleBetweenLines(
  U1_AXIS,
  L1_AXIS,
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
    const results: AnalysisResult[] = [];
    if (values[INTERINCISAL_ANGLE.symbol] !== undefined) {
      // @TODO
    }

    if (values[L1_MP.symbol] !== undefined) {
      let severity = AnalysisResultSeverity.NONE;
      let type = LowerIncisorInclination.normal;
      const value = values[L1_MP.symbol] as number;
      const { norm, stdDev } = angleBetweenLowerIncisorToMP;
      if (value < norm - stdDev) {
        type = LowerIncisorInclination.lingual;
      } else if (value > norm + stdDev) {
        type = LowerIncisorInclination.labial;
      }
      results.push({
        type,
        severity,
        relevantComponents: [L1_MP.symbol],
      });
    }
    
    if (values[U1_SN.symbol] !== undefined) {
      let severity = AnalysisResultSeverity.NONE;
      let type = UpperIncisorInclination.normal;
      const value = values[U1_SN.symbol] as number;
      const { norm, stdDev } = angleBetweenUpperIncisorToSN;
      if (value < norm - stdDev) {
        type = UpperIncisorInclination.palatal;
      } else if (value > norm + stdDev) {
        type = UpperIncisorInclination.labial;
      }
      results.push({
        type,
        severity,
        relevantComponents: [U1_SN.symbol],
      });
    }
    return results;
  }
}

export default analysis;