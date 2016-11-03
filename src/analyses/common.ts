import assign from 'lodash/assign';

import {
  line, point,
  angleBetweenPoints, angleBetweenLines,
  ProblemSeverity, SkeletalPattern, Mandible, Maxilla,
  MandibularRotation,
} from './helpers';

import {
  calculateAngleBetweenTwoVectors,
  radiansToDegrees,
} from 'utils/math';

/**
 * Most superior point of outline of external auditory meatus
 */
export const Po = point('Po', 'Porion');

/**
 * Most inferior point on margin of orbit
 */
export const Or = point('Or', 'Orbitale');

/**
 * Midpoint of sella turcica
 */
export const S = point('S', 'Sella');

/**
 * Most anterior point on frontonasal suture
 */
export const N = point('N', 'Nasion');
export const Na = N;

/**
 * Most concave point of anterior maxilla
 */
export const A = point('A', 'Subspinale');

/**
 * Most concave point on mandibular symphysis
 */
export const B = point('B', 'Supramentale');

/**
 * Most anterior point of mandibular symphysis
 */
export const Pog = point('Pog', 'Pogonion');

/**
 * Point located perpendicular on madibular symphysis midway between pogonion and menton
 */
export const Gn = point('Gn', 'Gnathion');


/**
 * Junction between inferior surface of the cranial base and the posterior border of the ascending rami of the mandible
 */
export const Ar = point(
  'Ar', 'Articulare',
  'Junction between inferior surface of the cranial base ' +
  'and the posterior border of the ascending rami of the mandible'
);

/**
 * Frankfort Horizontal Plane
 * Po-Or line projected to form a plane
 */
export const FH_PLANE = line(Po, Or, 'Frankfort Horizontal Plane', 'FH');

/**
 * A line connecting sella to nasion
 */
export const SELLA_NASION_LINE = line(S, N);

/**
 * SNA (sella, nasion, A point) indicates whether or not the maxilla is normal, prognathic, or retrognathic.
 */
export const SNA = angleBetweenPoints(S, N, A);

/**
 * SNB (sella, nasion, B point) indicates whether or not the mandible is normal, prognathic, or retrognathic.
 */
export const SNB = angleBetweenPoints(S, N, B);

/**
 * ANB (A point, nasion, B point) indicates whether the skeletal relationship between the maxilla and mandible is a normal skeletal class I (+2 degrees), a skeletal Class II (+4 degrees or more), or skeletal class III (0 or negative) relationship.
 * ANB is a custom landmark that has a positive sign if A is in front of N-B, negative otherwise.
 */
export const ANB: CephaloAngle = assign(
  angleBetweenLines(line(N, A), line(N, B)),
  {
    calculate(mapper: CephaloMapper, lineNA: GeometricalVector, lineNB: GeometricalVector) {
      const _A = { x: lineNA.x2, y: lineNA.y2 };
      const positiveValue = Math.abs(radiansToDegrees(calculateAngleBetweenTwoVectors(lineNA, lineNB)));
      if (mapper.isBehind(_A, lineNB)) {
        return -1 * positiveValue;
      }
      return positiveValue;
    },
  },
);


/**
 * Most posterior inferior point on angle of mandible.
 * Can also be constructed by bisecting the angle formed by intersection of mandibular plane and ramus of mandible */
export const Go = point('Go', 'Gonion', 'Most posterior inferior point on angle of mandible');

/**
 * Lowest point on mandibular symphysis
 */
export const Me = point('Me', 'Menton', 'Lowest point on mandibular symphysis');

/** Mandiblular Plane */
export const MP = line(Go, Me);

/**
 * Angle between Frankfort horizontal line and the line intersecting Gonion-Menton
 */
export const FMPA: CephaloAngle = angleBetweenLines(FH_PLANE, MP, 'Frankfort Mandibular Plane Angle', 'FMPA');
export const FMA = FMPA;

/**
 * Angle between SN and the mandibular plane
 */
export const SN_to_MP: CephaloAngle = angleBetweenLines(line(S, N), MP, 'SN-MP', 'SN-MP');

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
    landmark: SN_to_MP,
    norm: 35,
    stdDev: 5,
  },
];

export const interpretSN_to_MP = (value: number, min = 30, max = 40): AnalysisInterpretation => {
  const relevantComponents = [SN_to_MP.symbol];
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
  let severity = ProblemSeverity.NONE;
  // const severity = Math.min(
  //   AnalysisResultSeverity.HIGH,
  //   Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  // );
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
    const valueOfSN_to_MP = values[SN_to_MP.symbol];
    if (typeof valueOfSN_to_MP === 'number') {
      results.push(interpretSN_to_MP(valueOfSN_to_MP));
    }
    return results;
  },
};

export default analysis;
