import { 
  line, point,
  angleBetweenPoints, getSymbolForAngle,
  AnalysisResultSeverity, SkeletalPattern, Mandible, Maxilla
} from './helpers';

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
 * ANB is a custom landmark that is calculated as the SNA - SNB,
 * because otherwise it would not be a negative value in cases where it should be.
 */
export const ANB: CephaloAngle = {
  symbol: getSymbolForAngle(line(A, N), line(N, B)),
  type: 'angle',
  unit: 'degree',
  components: [SNA, SNB],
  calculate(SNA: number, SNB: number) {
    return SNA - SNB;
  },
};

export const components: AnalysisComponent[] = [
  {
    landmark: ANB,
    norm: 2,
  },
  {
    landmark: SNB,
    norm: 80,
  },
  {
    landmark: SNA,
    norm: 82,
  },
];

export const interpretANB = (value: number, min = 0, max = 4): AnalysisResult => {
  // @TODO: handle severity
  const symbol = ANB.symbol;
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
    value,
    symbol,
  };
};

export const interpretSNA = (value: number, min = 80, max = 84): AnalysisResult => {
  // @TODO: handle severity
  const symbol = SNA.symbol;
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
    value,
    symbol,
  };
};

export const interpretSNB = (value: number, min = 78, max = 82): AnalysisResult => {
  // @TODO: handle severity
  const symbol = SNB.symbol;
  let type = Mandible.normal;
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(value - ((min + max) / 2)) / 3),
  );
  if (value > max) {
    type = Mandible.prognathic;
  } else if (value < min) {
    type = Mandible.retrognathic;
  }
  return {
    type,
    severity,
    value,
    symbol,
  };
};

export interface EvaluatedValues {
  SNA?: number;
  SNB?: number;
  ANB?: number;
}

const analysis: Analysis = {
  id: 'commons',
  components,
  interpret(values: EvaluatedValues) {
    const results: AnalysisResult[] = [];
    if (values.ANB !== undefined) results.push(interpretANB(values.ANB as number));
    if (values.SNA !== undefined) results.push(interpretSNA(values.SNA as number));
    if (values.SNB !== undefined) results.push(interpretSNB(values.SNB as number));
    return results;
  }
}

export default analysis;