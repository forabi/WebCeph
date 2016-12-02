import {
  ProblemSeverity,
  GrowthPattern,
} from 'analyses/helpers';

import { Z } from 'analyses/landmarks/angles/soft';

export const zAngle: AnalysisComponent = {
  landmark: Z,
  norm: 80,
  stdDev: 9,
};

export const interpretZAngle = (value: number, min = 71, max = 89): AnalysisInterpretation[] => {
  let severity = ProblemSeverity.NONE;
  let indication = GrowthPattern.normal;
  // @TODO: handle severity
  if (value < min) {
    indication = GrowthPattern.horizontal;
  } else if (value > max) {
    indication = GrowthPattern.vertical;
  }
  // @TODO: report mandibular rotation?
  return [{
    indication,
    severity,
    relevantComponents: [Z.symbol],
  }];
};

const analysis: Analysis = {
  id: 'softTissues',
  components: [
    zAngle,
  ],
  interpret(values) {
    const results: AnalysisInterpretation[] = [];
    const valueOfZAngle = values[Z.symbol];
    if (typeof valueOfZAngle === 'number') {
      // results.push(...interpretZAngle(valueOfZAngle));
    }
    return results;
  },
};

export default analysis;
