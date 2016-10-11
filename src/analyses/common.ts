import assign from 'lodash/assign';

import { 
  line, point,
  angleBetweenPoints, angleBetweenLines,
  AnalysisResultSeverity, SkeletalPattern, Mandible, Maxilla,
  MandibularRoation,
} from './helpers';

import {
  calculateAngleBetweenTwoVectors,
  isBehind,
  radiansToDegrees,
} from '../utils/math';

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
    calculate(lineNA: GeometricalVector, lineNB: GeometricalVector) {
      const A = { x: lineNA.x2, y: lineNA.y2 };
      const positiveValue = radiansToDegrees(calculateAngleBetweenTwoVectors(lineNA, lineNB));
      if (isBehind(A, lineNB)) {
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
];

export const interpretANB = (value: number, min = 0, max = 4): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [ANB.symbol];
  const severity: AnalysisResultSeverity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  );
  let type = SkeletalPattern.class1;
  if (value > max) {
    type = SkeletalPattern.class2;
  } else if (value < min) {
    type = SkeletalPattern.class3;
  }
  return {
    type,
    severity,
    relevantComponents,
  };
};

export const interpretSNA = (value: number, min = 80, max = 84): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [SNA.symbol];
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  );
  let type = Maxilla.normal;
  if (value > max) {
    type = Maxilla.prognathic;
  } else if (value < min) {
    type = Maxilla.retrognathic;
  }
  return {
    type,
    severity,
    relevantComponents,
  };
};

export const interpretSNB = (value: number, min = 78, max = 82): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [SNB.symbol];
  let type = Mandible.normal;
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 5),
  );
  if (value > max) {
    type = Mandible.prognathic;
  } else if (value < min) {
    type = Mandible.retrognathic;
  }
  return {
    type,
    severity,
    relevantComponents,
  };
};

export const interpretFMPA = (value: number, min = 16.9, max = 26.9): AnalysisResult => {
  // @TODO: handle severity
  const relevantComponents = [FMPA.symbol];
  let type = MandibularRoation.normal;
  let severity = AnalysisResultSeverity.NONE;
  // const severity = Math.min(
  //   AnalysisResultSeverity.HIGH,
  //   Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  // );
  if (value > max) {
    type = MandibularRoation.clockwise;
  } else if (value < min) {
    type = MandibularRoation.counterClockwise;
  }
  return {
    type,
    severity,
    relevantComponents,
  };
}

export interface EvaluatedValues {
  SNA?: number;
  SNB?: number;
  ANB?: number;
  FMPA?: number;
}

const analysis: Analysis = {
  id: 'commons',
  components,
  interpret(values: EvaluatedValues) {
    const results: AnalysisResult[] = [];
    if (values.ANB !== undefined) results.push(interpretANB(values.ANB as number));
    if (values.SNA !== undefined) results.push(interpretSNA(values.SNA as number));
    if (values.SNB !== undefined) results.push(interpretSNB(values.SNB as number));
    if (values.FMPA !== undefined) results.push(interpretFMPA(values.FMPA as number));
    return results;
  }
}

export default analysis;