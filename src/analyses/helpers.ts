import flatten from 'lodash/flatten';
import map from 'lodash/map';
import xorWith from 'lodash/xorWith';
import uniqWith from 'lodash/uniqWith';
import has from 'lodash/has';
import every from 'lodash/every';
import join from 'lodash/join';
import reduce from 'lodash/reduce';
import isPlainObject from 'lodash/isPlainObject';

export function getSymbolForAngle(lineA: CephaloLine, lineB: CephaloLine): string {
  const A = lineA.components[1];
  const B = lineB.components[0];
  const C = lineB.components[1];
  return map([A, B, C], c => c.symbol).join('');
}

/**
 * Creates an object conforming to the Angle interface based on 2 lines
 */
export function angleBetweenLines(lineA: CephaloLine, lineB: CephaloLine, name?: string, symbol?: string, unit: AngularUnit = 'degree'): CephaloAngle {
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
export function angleBetweenPoints(A: CephaloPoint, B: CephaloPoint, C: CephaloPoint, name?: string, unit: AngularUnit = 'degree'): CephaloAngle {
  return angleBetweenLines(line(B, A), line(B, C), name, undefined, unit);
}

export function point(symbol: string, name?: string, description?: string): CephaloPoint {
  return {
    type: 'point',
    name,
    symbol,
    description,
    components: [],
  }
}

/**
 * Creates an object conforming to the Line interface connecting two points
 */
export function line(A: CephaloPoint, B: CephaloPoint, name?: string, symbol?: string, unit: LinearUnit = 'mm'): CephaloLine {
  return {
    type: 'line',
    name,
    unit,
    symbol: symbol || `${A.symbol}-${B.symbol}`,
    components: [A, B],
  };
}

export function distance(A: CephaloPoint, B: CephaloPoint, name?: string, unit: LinearUnit = 'mm'): CephaloDistance {
  return {
    type: 'distance',
    name,
    unit,
    components: [A, B],
    symbol: `distance_${A.symbol}_${B.symbol}`,
  }
}

export function angularSum(components: CephaloAngle[], name: string, symbol?: string): CephaloAngularSum {
  return {
    type: 'sum',
    name,
    unit: components[0].unit,
    symbol: symbol || join(map(components, c => c.symbol), '+'),
    components: components,
  };
}

export function areEqualSteps(l1: CephaloLandmark, l2: CephaloLandmark): boolean {
  if (l1.type !== l2.type) return false;
  if (l1.symbol === l2.symbol) return true;
  if (l1.components.length === 0) return false;
  if (l1.components.length !== l2.components.length) return false;
  return (
    xorWith(l1.components, l2.components, areEqualSteps).length === 0
  );
};

export function areEqualSymbols(l1: CephaloLandmark, l2: CephaloLandmark) {
  return l1.symbol === l2.symbol;
};

export function getStepsForLandmarks(landmarks: CephaloLandmark[], removeEqualSteps: boolean = true): CephaloLandmark[] {
  return uniqWith(
    flatten(map(
      landmarks,
      (landmark: CephaloLandmark) => {
        if (!landmark) {
          __DEBUG__ && console.warn(
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

export function getStepsForAnalysis(analysis: Analysis, deduplicateVectors: boolean = true): CephaloLandmark[] {
  return getStepsForLandmarks(analysis.components.map(c => c.landmark), deduplicateVectors);
};

export function flipVector(vector: CephaloLine) {
  return line(vector.components[1], vector.components[0]);
};

export function isCephaloPoint(object: any): object is CephaloPoint {
  return isPlainObject(object) && object.type === 'point';
};

export function isCephaloLine(object: any): object is CephaloLine {
  return isPlainObject(object) && object.type === 'line';
};

export function isCephaloAngle(object: any): object is CephaloAngle {
  return isPlainObject(object) && object.type === 'angle';
};

import {
  calculateAngleBetweenTwoVectors,
  calculateAngleBetweenPoints,
  calculateDistanceBetweenTwoPoints,
  radiansToDegrees,
} from '../utils/math';

export function computeOrMap(landmark: CephaloLandmark, mapper: CephaloMapper): number | GeometricalObject | undefined {
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
export function tryMap(landmark: CephaloLandmark, mapper: CephaloMapper): GeometricalObject | undefined {
  if (isCephaloAngle(landmark)) {
    return mapper.toAngle(landmark);
  } else if (isCephaloLine(landmark)) {
    return mapper.toVector(landmark);
  } else if (isCephaloPoint(landmark)) {
    return mapper.toPoint(landmark);
  }
  return undefined;
};

/**
 * Calculates the value of a landmark on a cephalometric radiograph
 */
export function compute(landmark: CephaloLandmark, mapper: CephaloMapper): number | undefined {
  if (landmark.calculate) {
    return landmark.calculate.apply(
      landmark, 
      map(landmark.components, l => computeOrMap(l, mapper))
    );
  } else if (landmark.type === 'angle') {
    let result: number;
    if (landmark.components[0].type === 'point') {
      const points: GeometricalPoint[] = map(landmark.components as CephaloPoint[], mapper.toPoint);
      result = calculateAngleBetweenPoints(points[0], points[1], points[2]);
    } else {
      const lines = map(landmark.components as CephaloLine[], mapper.toVector);
      result = calculateAngleBetweenTwoVectors(lines[0], lines[1]);
    }
    return landmark.unit === 'degree' ? radiansToDegrees(result) : result;
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
};

/** The anterior-posterior position of the maxilla relative to a reference plane */
export enum Maxilla {
  prognathic = 3,
  retrognathic,
  /** Indicates the maxilla is neither retrognathic nor prognathic */
  normal,
};

/** The anterior-posterior position of the mandible relative to a reference plane */
export enum Mandible {
  // Mandible
  prognathic = 6,
  retrognathic,
  /** Indicates the mandible is neither retrognathic nor prognathic */
  normal,
};

export enum SkeletalProfile {
  normal = 9,
  concave,
  convex,
};

/** The pattern of rotation of the mandible */
export enum MandibularRotation {
  normal = 12,
  clockwise,
  vertical = clockwise,
  counterClockwise,
  horizontal = counterClockwise,
};

export enum GrowthPattern {
  normal = 15,
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

export enum ProblemSeverity {
  NONE = 0,
  UNKNOWN = NONE,
  LOW = 1,
  SLIGHT = LOW,
  MEDIUM = 2,
  HIGH = 3,
  SEVERE = HIGH,
};

export function isSkeletalPattern(value: number | string): value is SkeletalPattern {
  return has(SkeletalPattern, value);
};

export function isMaxilla(value: number | string): value is Maxilla {
  return has(Maxilla, value);
};

export function isMandible(value: number | string): value is Mandible {
  return has(Mandible, value);
};

export function isSkeletalProfile(value: number | string): value is SkeletalProfile {
  return has(SkeletalProfile, value);
};

export function isMandiblularRotation(value: number | string): value is MandibularRotation {
  return has(MandibularRotation, value);
};

export function isGrowthPattern(value: number | string): value is GrowthPattern {
  return has(GrowthPattern, value);
};

export function isLowerIncisorInclination(value: number | string): value is LowerIncisorInclination {
  return has(LowerIncisorInclination, value);
};

export function isUpperIncisorInclination(value: number | string): value is UpperIncisorInclination {
  return has(UpperIncisorInclination, value);
};

export function isSkeletalBite(value: number | string): value is SkeletalBite {
  return has(SkeletalBite, value);
};

export function getDisplayNameForResult({ indication }: AnalysisInterpretation) {
  if (isSkeletalPattern(indication)) {
    return 'Skeletal Pattern';
  } else if (isSkeletalProfile(indication)) {
    return 'Skeletal Profile';
  } else if (isMaxilla(indication)) {
    return 'Maxilla';
  } else if (isMandible(indication)) {
    return 'Mandible';
  } else if (isMandiblularRotation(indication)) {
    return 'Mandiblular Rotation';
  } else if (isGrowthPattern(indication)) {
    return 'Growth Pattern';
  } else if (isLowerIncisorInclination(indication)) {
    return 'Lower Insicor Inclination';
  } else if (isUpperIncisorInclination(indication)) {
    return 'Upper Insicor Inclination';
  } else if (isSkeletalBite(indication)) {
    return 'Skeletal Bite';
  }
  console.warn(
    `Cannot find name for analysis result of type ${indication}`,
  );
  return null;
};


/** Determines whether a step in a cephalometric analysis can be mapped to a geometrical object or computed as a numerical value */
export const isStepAutomatic = (step: CephaloLandmark): boolean => {
  if (step.type === 'point') {
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
export const isStepManual = (step: CephaloLandmark) => !isStepAutomatic(step);

/** Determines whether a step in a cephalometric analysis returns a numerical value when evaluated */
export const isStepComputable = (step: CephaloLandmark) => {
  return (
    step.type === 'sum' ||
    step.type === 'angle' ||
    step.type === 'distance' ||
    typeof step.calculate === 'function'
  );
};

/**
 * Tries to return the most reasonable severity value given contradicting interpretations of the evaluated values of an analysis
 */
export function resolveSeverity(results: AnalysisInterpretation[]) {
  return reduce<AnalysisInterpretation, ProblemSeverity>(
    results,
    (previousValue, result) => {
      // @TODO: improve the logic
      return result.severity > previousValue ? result.severity : previousValue;
    },
    results[0].severity,
  );
};

/**
 * Tries to return the most reasonable indication given contradicting interpretations of the evaluated values of an analysis
 */
export function resolveIndication(results: AnalysisInterpretation[], values: { [symbol: string]: EvaluatedValue }) {
  // @TODO: improve the logic
  return results[0].indication;
};
