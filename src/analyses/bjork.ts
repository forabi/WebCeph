import {
  angularSum,
  ProblemSeverity,
  GrowthPattern,
} from 'analyses/helpers';

import { NSAr, SArGo, ArGoMe } from 'analyses/landmarks/angles';

export const BJORK_SUM = angularSum([NSAr, SArGo, ArGoMe], 'Björk\'s sum', 'Björk');

export const sumOfBjork: AnalysisComponent = {
  landmark: BJORK_SUM,
  norm: 396,
  stdDev: 6,
};

export const interpretSumOfBjork = (value: number, min = 390, max = 402): AnalysisInterpretation[] => {
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
    relevantComponents: [BJORK_SUM.symbol],
  }];
};

const analysis: Analysis = {
  id: 'bjork',
  components: [
    sumOfBjork,
  ],
  interpret(values) {
    const results: AnalysisInterpretation[] = [];
    const valueOfBjork = values[BJORK_SUM.symbol];
    if (typeof valueOfBjork === 'number') {
      results.push(...interpretSumOfBjork(valueOfBjork));
    }
    return results;
  },
};

export default analysis;
