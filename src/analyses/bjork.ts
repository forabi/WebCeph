import {
  angularSum, angleBetweenPoints,
  ProblemSeverity,
  GrowthPattern,
} from './helpers';

import { N, S, Ar, Go, Me } from './common';

/**
 * Saddle Angle
 */
export const NSAr = angleBetweenPoints(N, S, Ar, 'Saddle Angle');

/**
 * Articular Angle
 */
export const SArGo = angleBetweenPoints(S, Ar, Go, 'Articular Angle');

/**
 * Gonial Angle
 */
export const ArGoMe = angleBetweenPoints(Ar, Go, Me, 'Gonial Angle');

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
