import has from 'lodash/has';
import { angleBetweenPoints, line, point, getSymbolForAngle } from './helpers';

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
 * Angle SNA describes the skeletal relation of the maxilla to the skull
 */
export const SNA = angleBetweenPoints(S, N, A);

/**
 * Angle SNB describes the skeletal relation of the mandible to the skull
 */
export const SNB = angleBetweenPoints(S, N, B);

/**
 * Angle ANB is a custom landmark that is calculated as the SNA - SNB,
 * because otherwise it would not be a negative value in cases where it should be.
 */
export const ANB: BaseCephaloLandmark = {
  symbol: getSymbolForAngle(line(A, N), line(N, B)),
  type: 'angle',
  unit: 'degree',
  components: [SNA, SNB],
  calculate(SNA: number, SNB: number) {
      return SNA - SNB;
  },
};

export const components = [
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


const interpretANB = (ANB: number, min = 0, max = 4) => {
  if (ANB > max) {
    return AnalysisResult.CLASS_II_SKELETAL_PATTERN;
  } else if (ANB < min) {
    return AnalysisResult.CLASS_III_SKELETAL_PATTERN;
  } else {
    return AnalysisResult.CLASS_I_SKELETAL_PATTERN;
  }
};

const interpretSNA = (SNA: number, min = 80, max = 84) => {
  if (SNA > max) {
    return AnalysisResult.PROGNATHIC_MAXILLA;
  } else if (SNA < min) {
    return AnalysisResult.RETROGNATHIC_MAXILLA;
  } else {
    return AnalysisResult.NORMAL_MAXILLA;
  }
};

const interpretSNB = (SNB: number, min = 78, max = 82) => {
  if (SNB > max) {
    return AnalysisResult.PROGNATHIC_MANDIBLE;
  } else if (SNB < min) {
    return AnalysisResult.RETROGNATHIC_MANDIBLE;
  } else {
    return AnalysisResult.NORMAL_MANDIBLE;
  }
};

type EvalutedValues = {
  SNA?: number;
  SNB?: number;
  ANB?: number;
}

const analysis: Analysis = {
  id: 'commons',
  components,
  interpret(values: EvalutedValues) {
    const results: AnalysisResult[] = [];
    if (has(values, 'ANB')) results.push(interpretANB(values.ANB as number));
    if (has(values, 'SNA')) results.push(interpretSNA(values.SNA as number));
    if (has(values, 'SNB')) results.push(interpretSNB(values.SNB as number));
    return results;
  }
}

export default analysis;