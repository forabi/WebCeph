import flatten from 'lodash/flatten';
import map from 'lodash/map';
import xorWith from 'lodash/xorWith';
import uniqWith from 'lodash/uniqWith';
import uniqBy from 'lodash/uniqBy';
import every from 'lodash/every';
import join from 'lodash/join';
import reduce from 'lodash/reduce';
import isPlainObject from 'lodash/isPlainObject';

import { isGeometricalAngle } from 'utils/math';

export function getSymbolForAngle(line1: CephLine, line2: CephLine): string {
  const A = line1.components[0]; // N
  const B = line1.components[1]; // S
  const C = line2.components[0]; // N
  const D = line2.components[1]; // A
  if (A.symbol === C.symbol || B.symbol === D.symbol) {
    const uniqArray = uniqBy([B, C, D, A], p => p.symbol);
    return map(uniqArray, c => c.symbol).join('');
  } else {
    return map([line1, line2], c => c.symbol).join(',');
  }
}

/**
 * Creates an object conforming to the Angle interface based on 2 lines
 */
export function angleBetweenLines(
  lineA: CephLine, lineB: CephLine,
  name?: string, symbol?: string,
  unit: AngularUnit = 'degree',
): CephAngle {
  return {
    type: 'angle',
    symbol: symbol || getSymbolForAngle(lineA, lineB),
    unit,
    name,
    components: [lineA, lineB],
  };
}

/**
 * Creates an object conforming to the Angle interface based on 3 points
 */
export function angleBetweenPoints(
  A: CephPoint, B: CephPoint, C: CephPoint,
  name?: string,
  unit: AngularUnit = 'degree'
): CephAngle {
  return angleBetweenLines(line(B, A), line(B, C), name, undefined, unit);
}

export function point(symbol: string, name?: string, description?: string): CephPoint {
  return {
    type: 'point',
    name,
    symbol,
    description,
    components: [],
  };
}

/**
 * Creates an object conforming to the Line interface connecting two points
 */
export function line(
  A: CephPoint, B: CephPoint,
  name?: string, symbol?: string,
  unit: LinearUnit = 'mm',
): CephLine {
  return {
    type: 'line',
    name,
    unit,
    symbol: symbol || `${A.symbol}-${B.symbol}`,
    components: [A, B],
  };
}

export function distance(A: CephPoint, B: CephPoint, name?: string, unit: LinearUnit = 'mm'): CephDistance {
  return {
    type: 'distance',
    name,
    unit,
    components: [A, B],
    symbol: `distance_${A.symbol}_${B.symbol}`,
  };
}

export function angularSum(components: CephAngle[], name: string, symbol?: string): CephAngularSum {
  return {
    type: 'sum',
    name,
    unit: components[0].unit,
    symbol: symbol || join(map(components, c => c.symbol), '+'),
    components,
  };
}

export function areEqualSteps(l1: CephLandmark, l2: CephLandmark): boolean {
  if (l1.symbol === l2.symbol) {
    return true;
  }
  if (l1.type !== l2.type) {
    return false;
  }
  if (l1.components.length === 0) {
    return false;
  }
  if (l1.components.length !== l2.components.length) {
    return false;
  }
  return (
    xorWith(l1.components, l2.components, areEqualSteps).length === 0
  );
};

export function areEqualSymbols(l1: CephLandmark, l2: CephLandmark) {
  return l1.symbol === l2.symbol;
};

export function getStepsForLandmarks(
  landmarks: CephLandmark[], removeEqualSteps = true
): CephLandmark[] {
  return uniqWith(
    flatten(map(
      landmarks,
      (landmark: CephLandmark) => {
        if (!landmark) {
          console.warn(
            'Got unexpected value in getStepsForLandmarks. ' +
            'Expected a Cephalo.Landmark, got ' + landmark,
          );
          return [];
        }
        return [
          ...getStepsForLandmarks(landmark.components),
          landmark,
        ];
      },
    )),
    removeEqualSteps ? areEqualSteps : areEqualSymbols,
  );
};

export function getStepsForAnalysis(
  analysis: Analysis,
  deduplicateVectors = true
): CephLandmark[] {
  return getStepsForLandmarks(analysis.components.map(c => c.landmark), deduplicateVectors);
};

export function flipVector(vector: CephLine) {
  return line(vector.components[1], vector.components[0]);
};

export function isCephPoint(object: any): object is CephPoint {
  return isPlainObject(object) && object.type === 'point';
};

export function isCephLine(object: any): object is CephLine {
  return isPlainObject(object) && object.type === 'line';
};

export function isCephaloAngle(object: any): object is CephAngle {
  return isPlainObject(object) && object.type === 'angle';
};

import {
  calculateAngleBetweenTwoVectors,
  calculateDistanceBetweenTwoPoints,
  radiansToDegrees,
} from '../utils/math';

export function computeOrMap(landmark: CephLandmark, mapper: CephMapper): number | GeometricalObject | undefined {
  if (landmark.type === 'line') {
    return mapper.toVector(landmark);
  } else if (landmark.type === 'point') {
    return mapper.toPoint(landmark);
  } else {
    return compute(landmark, mapper);
  }
};

/**
 * Tries mapping a CephaloLanmark with the specified CephaloMapper.
 * Returns the GeometricalObject the landmark maps to.
 * Returns undefined if the landmark type is not mappable.
 */
export function tryMap(landmark: CephLandmark, mapper: CephMapper): GeometricalObject | undefined {
  if (typeof landmark.map === 'function') {
    return landmark.map(mapper, ...map(landmark.components, c => tryMap(c, mapper)));
  } else if (isCephaloAngle(landmark)) {
    return mapper.toAngle(landmark);
  } else if (isCephLine(landmark)) {
    return mapper.toVector(landmark);
  } else if (isCephPoint(landmark)) {
    return mapper.toPoint(landmark);
  }
  return undefined;
};

/**
 * Calculates the value of a landmark on a cephalometric radiograph
 */
export function compute(landmark: CephLandmark, mapper: CephMapper): number | undefined {
  if (landmark.calculate) {
    return landmark.calculate.apply(
      landmark,
      [mapper, ...map(landmark.components, l => computeOrMap(l, mapper))]
    );
  } else if (landmark.type === 'angle') {
    let result: number;
    const angle = tryMap(landmark, mapper);
    if (isGeometricalAngle(angle)) {
      result = calculateAngleBetweenTwoVectors(angle.vectors[0], angle.vectors[1]);
      return landmark.unit === 'degree' ? radiansToDegrees(result) : result;
    }
  } else if (landmark.type === 'distance') {
    if (mapper.scaleFactor === null) {
      return undefined;
    }
    const points: GeometricalPoint[] = map(landmark.components, mapper.toPoint);
    const result = calculateDistanceBetweenTwoPoints(points[0], points[1]) * mapper.scaleFactor;
    const unit = landmark.unit;
    return unit === 'mm' ? result : unit === 'cm' ? result / 10 : result / 25.4;
  } else if (landmark.type === 'sum') {
    return reduce(landmark.components, (sum, t) => sum + (compute(t, mapper) as number), 0);
  }
  return undefined;
};

/** The anterior-posterior skeletal relationship of the jaws */
export enum SkeletalPattern {
  class1 = 0,
  class2,
  class3,
  tendencyForClass3,
};

/** The anterior-posterior position of the maxilla relative to a reference plane */
export enum Maxilla {
  prognathic = 4,
  retrognathic,
  /** Indicates the maxilla is neither retrognathic nor prognathic */
  normal,
};

/** The anterior-posterior position of the mandible relative to a reference plane */
export enum Mandible {
  // Mandible
  prognathic = 7,
  retrognathic,
  /** Indicates the mandible is neither retrognathic nor prognathic */
  normal,
};

export enum SkeletalProfile {
  normal = 10,
  concave,
  convex,
};

/** The pattern of rotation of the mandible */
export enum MandibularRotation {
  normal = 13,
  clockwise,
  vertical = clockwise,
  counterClockwise,
  horizontal = counterClockwise,
};

export enum GrowthPattern {
  normal = 16,
  clockwise,
  vertical = clockwise,
  counterClockwise,
  horizontal = counterClockwise,
};

export enum UpperIncisorInclination {
  buccal = 19,
  labial = buccal,
  palatal,
  normal,
};

export enum LowerIncisorInclination {
  buccal = 22,
  labial = buccal,
  lingual,
  normal,
};

export enum SkeletalBite {
  normal = 25,
  open,
  closed,
};


const categoryMap: Record<Category, string> = {
  growthPattern: 'Growth Pattern',
  lowerIncisorInclination: 'Lower incisor inclination',
  upperIncisorInclination: 'Upper incisor inclination',
  mandible: 'Mandible',
  maxilla: 'Maxilla',
  mandibularRotation: 'Mandibular rotation',
  skeletalBite: 'Skeletal bite',
  skeletalPattern: 'Skeletal pattern',
  skeletalProfile: 'Skeletal profile',
};

export const getDisplayNameForResult = <T extends Category>(
  { category }: LandmarkInterpretation<T>
) => categoryMap[category];

/**
 * Determines whether a step in a cephalometric analysis can be mapped
 * to a geometrical object or computed as a numerical value
 */
export const isStepAutomatic = (step: CephLandmark): boolean => {
  if (typeof step.map === 'function') {
    return true;
  } else if (step.type === 'point') {
    return false;
  } else if (step.type === 'line') {
    return every(step.components, s => s.type === 'point');
  } else if (step.type === 'angle') {
    return every(step.components, isStepAutomatic);
  } else if (step.type === 'distance') {
    return true;
  } else if (step.type === 'sum') {
    return true;
  }
  return false;
};

/** Determines whether a step in a cephalometric analysis needs to be performed by the user  */
export const isStepManual = (step: CephLandmark) => !isStepAutomatic(step);

/** Determines whether a step in a cephalometric analysis returns a numerical value when evaluated */
export const isStepComputable = (step: CephLandmark) => {
  return (
    step.type === 'sum' ||
    step.type === 'angle' ||
    step.type === 'distance' ||
    typeof step.calculate === 'function'
  );
};

export function defaultInterpetAnalysis(analysis: Analysis) {
  return (values: Record<string, EvaluatedValue>): AnalysisInterpretation[] => {
    return flatten(
      map(analysis.components, ({ landmark, stdDev, norm }) => {
        const interpret = landmark.interpret;
        const value = values[landmark.symbol];
        if (typeof value !== 'undefined' && typeof interpret === 'function' && typeof value === 'number') {
          return map(
            interpret(value, norm - stdDev, norm + stdDev),
            r => ({ ...r, relevantComponents: [landmark.symbol] }),
          );
        } else {
          return [];
        }
      }),
    );
  };
};

export const defaultInterpetLandmark = <T extends Category>(
  category: T, ranges: [Indication<T>, Indication<T>, Indication<T>],
) => {
  return (value: number, max: number, min: number): Array<LandmarkInterpretation<T>> => {
    let indication = ranges[1];
    let severity: Severity = 'none';
    if (value > max) {
      indication = ranges[2];
    } else if (value < min) {
      indication = ranges[0];
    }
    return [{ category, indication, severity }];
  };
};

interface InterpretationFunction<T extends Category> {
  (value: number, max: number, min: number): Array<LandmarkInterpretation<T>>;
}

export const composeInterpretation = <T extends Category>(
  ...args: Array<InterpretationFunction<T>>
) => {
  return (value: number, max: number, min: number) => {
    return flatten(map(args, fn => fn(value, max, min)));
  };
};

/**
 * Tries to return the most reasonable severity value given contradicting
 * interpretations of the evaluated values of an analysis
 */
export function resolveSeverity(results: LandmarkInterpretation[]) {
  return reduce<LandmarkInterpretation, ProblemSeverity>(
    results,
    (previousValue, result) => {
      // @TODO: improve the logic
      return result.severity > previousValue ? result.severity : previousValue;
    },
    results[0].severity,
  );
};

/**
 * Tries to return the most reasonable indication given contradicting
 * interpretations of the evaluated values of an analysis
 */
export function resolveIndication(
  results: LandmarkInterpretation[],
  values: { [symbol: string]: EvaluatedValue }
) {
  // @TODO: improve the logic
  return results[0].indication;
};
