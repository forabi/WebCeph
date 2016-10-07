import { angleBetweenPoints, line, point, getSymbolForAngle } from './helpers';
import { AnalysisResultSeverity, AnalysisResultType } from '../../constants';

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

export const interpretANB = (ANB: number, min = 0, max = 4): AnalysisResult => {
  // @TODO: handle severity
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(ANB - ((min + max) / 2)) / 3),
  );
  if (ANB > max) {
    return {
      type: AnalysisResultType.CLASS_II_SKELETAL_PATTERN,
      severity,
    };
  } else if (ANB < min) {
    return {
      type: AnalysisResultType.CLASS_III_SKELETAL_PATTERN,
      severity,
    };
  }
  return {
    type: AnalysisResultType.CLASS_I_SKELETAL_PATTERN,
    severity: AnalysisResultSeverity.NONE,
  };
};

export const interpretSNA = (SNA: number, min = 80, max = 84): AnalysisResult => {
  // @TODO: handle severity
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(SNA - ((min + max) / 2)) / 3),
  );
  if (SNA > max) {
    return {
      type: AnalysisResultType.PROGNATHIC_MAXILLA,
      severity,
    };  
  } else if (SNA < min) {
    return {
      type: AnalysisResultType.RETROGNATHIC_MAXILLA,
      severity,
    };
  }
  return {
    type: AnalysisResultType.NORMAL_MAXILLA,
    severity: AnalysisResultSeverity.NONE,
  };
};

export const interpretSNB = (SNB: number, min = 78, max = 82): AnalysisResult => {
  // @TODO: handle severity
  const severity = Math.min(
    AnalysisResultSeverity.HIGH,
    Math.round(Math.abs(SNB - ((min + max) / 2)) / 3),
  );
  if (SNB > max) {
    return {
      type: AnalysisResultType.PROGNATHIC_MANDIBLE,
      severity,
    };
  } else if (SNB < min) {
    return {
      type: AnalysisResultType.RETROGNATHIC_MANDIBLE,
      severity,
    }
  }
  return {
    type: AnalysisResultType.NORMAL_MANDIBLE,
    severity: AnalysisResultSeverity.NONE,
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