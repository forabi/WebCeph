import {
  ProblemSeverity, SkeletalPattern, Mandible, Maxilla,
  MandibularRotation,
} from './helpers';

import { SNA, SNB, ANB, FMPA, SN_MP } from 'analyses/landmarks/angles';

export const components: AnalysisComponent[] = [
  {
    landmark: SNA,
    norm: 82,
    stdDev: 2,
  },
  {
    landmark: SNB,
    norm: 80,
    stdDev: 2,
  },
  {
    landmark: ANB,
    norm: 2,
    stdDev: 2,
  },
  {
    landmark: FMPA,
    norm: 21.9,
    stdDev: 5,
  },
  {
    landmark: SN_MP,
    norm: 35,
    stdDev: 5,
  },
];

export const interpretSNtoMP = (value: number, min = 30, max = 40): AnalysisInterpretation => {
  const relevantComponents = [SN_MP.symbol];
  const severity: ProblemSeverity = ProblemSeverity.NONE;
  let indication = MandibularRotation.normal;
  if (value > max) {
    indication = MandibularRotation.clockwise;
  } else if (value < min) {
    indication = MandibularRotation.counterClockwise;
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

export const interpretANB = (value: number, min = 2, max = 4): AnalysisInterpretation => {
  // @TODO: handle severity
  const relevantComponents = [ANB.symbol];
  const severity = ProblemSeverity.UNKNOWN;
  let indication = SkeletalPattern.class1;
  if (value > max) {
    indication = SkeletalPattern.class2;
  } else if (value < min && value >= 0) {
    indication = SkeletalPattern.tendencyForClass3;
  } else if (value < 0) {
    indication = SkeletalPattern.class3;
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

export const interpretSNA = (value: number, min = 80, max = 84): AnalysisInterpretation => {
  // @TODO: handle severity
  const relevantComponents = [SNA.symbol];
  const severity = Math.min(
    ProblemSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  );
  let indication = Maxilla.normal;
  if (value > max) {
    indication = Maxilla.prognathic;
  } else if (value < min) {
    indication = Maxilla.retrognathic;
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

export const interpretSNB = (value: number, min = 78, max = 82): AnalysisInterpretation => {
  // @TODO: handle severity
  const relevantComponents = [SNB.symbol];
  let indication = Mandible.normal;
  const severity = Math.min(
    ProblemSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 5),
  );
  if (value > max) {
    indication = Mandible.prognathic;
  } else if (value < min) {
    indication = Mandible.retrognathic;
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

export const interpretFMPA = (value: number, min = 16.9, max = 26.9): AnalysisInterpretation => {
  // @TODO: handle severity
  const relevantComponents = [FMPA.symbol];
  let indication = MandibularRotation.normal;
  let severity = ProblemSeverity.UNKNOWN;
  if (value > max) {
    indication = MandibularRotation.clockwise;
  } else if (value < min) {
    indication = MandibularRotation.counterClockwise;
  }
  return {
    indication,
    severity,
    relevantComponents,
  };
};

const analysis: Analysis = {
  id: 'common',
  components,
  interpret(values) {
    const results: AnalysisInterpretation[] = [];
    const valueOfANB = values[ANB.symbol];
    if (typeof valueOfANB === 'number') {
      results.push(interpretANB(valueOfANB));
    }
    const valueOfSNA = values[SNA.symbol];
    if (typeof valueOfSNA === 'number') {
      results.push(interpretSNA(valueOfSNA));
    }
    const valueOfSNB = values[SNB.symbol];
    if (typeof valueOfSNB === 'number') {
      results.push(interpretSNB(valueOfSNB));
    }
    const valueOfFMPA = values[FMPA.symbol];
    if (typeof valueOfFMPA === 'number') {
      results.push(interpretFMPA(valueOfFMPA));
    }
    const valueOfSNtoMP = values[SN_MP.symbol];
    if (typeof valueOfSNtoMP === 'number') {
      results.push(interpretSNtoMP(valueOfSNtoMP));
    }
    return results;
  },
};

export default analysis;
