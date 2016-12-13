import flatten from 'lodash/flatten';
import map from 'lodash/map';
import xorWith from 'lodash/xorWith';
import uniqWith from 'lodash/uniqWith';
import uniqBy from 'lodash/uniqBy';
import sum from 'lodash/sum';
import join from 'lodash/join';
import isPlainObject from 'lodash/isPlainObject';
import countBy from 'lodash/countBy';
import maxBy from 'lodash/maxBy';
import groupBy from 'lodash/groupBy';

import {
  createVectorFromPoints,
  createAngleFromVectors,
  createPerpendicular,
  getSegmentLength,
  getVectorPoints,
  isBehind,
  calculateAngleBetweenTwoVectors,
  radiansToDegrees,
} from 'utils/math';

function getSymbolForAngle(line1: CephLine, line2: CephLine): string {
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

const defaultMapAngle: MapLandmark<GeoVector, GeoAngle> =
  (line1: GeoVector, line2: GeoVector) => createAngleFromVectors(line1, line2);

const defaultCalculateAngle: CalculateLandmark<undefined, GeoVector> =
  () => (lineA: GeoVector, lineB: GeoVector) =>
    radiansToDegrees(calculateAngleBetweenTwoVectors(lineA, lineB));

const defaultMapLine: MapLandmark<GeoPoint, GeoVector> =
  (A: GeoPoint, B: GeoPoint) => createVectorFromPoints(A, B);

const defaultMapDistance: MapLandmark<GeoObject, GeoVector> =
  (A: GeoPoint, line: GeoVector) => createPerpendicular(line, A);

const defaultCalculateLine: CalculateLandmark<undefined, GeoVector> =
  () => (segment: GeoVector) => {
    const length = getSegmentLength(segment);
    const [point, ] = getVectorPoints(segment);
    if (isBehind(point, segment)) {
      return -length;
    }
    return length;
  };

const defaultCalculateSum: CalculateLandmark<number, GeoObject> =
  (...values) => () => sum(values);

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
    map: defaultMapAngle,
    calculate: defaultCalculateAngle,
  };
}

/**
 * Creates an object conforming to the Angle interface based on 3 points
 */
export function angleBetweenPoints(
  A: CephPoint, B: CephPoint, C: CephPoint,
  name?: string,
  unit: AngularUnit = 'degree',
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
): CephLine {
  return {
    type: 'line',
    name,
    symbol: symbol || `${A.symbol}-${B.symbol}`,
    components: [A, B],
    map: defaultMapLine,
  };
};

export function distance(
  A: CephPoint, line: CephLine,
  name?: string, symbol?: string,
  unit: LinearUnit = 'mm',
): CephDistance {
  return {
    type: 'distance',
    name,
    unit,
    symbol: symbol || `${A.symbol}-${line.symbol}`,
    components: [A, line],
    map: defaultMapDistance,
    calculate: defaultCalculateLine,
  };
};

export function angularSum(components: CephAngle[], name: string, symbol?: string): CephAngularSum {
  return {
    type: 'sum',
    name,
    unit: components[0].unit,
    symbol: symbol || join(map(components, c => c.symbol), '+'),
    components,
    calculate: defaultCalculateSum,
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

export function isCephAngle(object: any): object is CephAngle {
  return isPlainObject(object) && object.type === 'angle';
};

/**
 * Tries mapping a CephaloLandmark.
 * Returns the GeoObject the landmark maps to.
 * Returns undefined if the landmark is not mappable.
 */
export function tryMap(landmark: CephLandmark): GeoObject | undefined {
  if (typeof landmark.map === 'function') {
    return landmark.map(...map(landmark.components, tryMap));
  }
  return undefined;
};

/**
 * Tries calculating the value of a landmark on a cephalometric radiograph.
 * Returns the calculated value as specified in the landmark.calculate method.
 * Returns undefined if the landmark cannot be calculated.
 */
export function tryCalculate(landmark: CephLandmark): number | undefined {
  if (typeof landmark.calculate === 'function') {
    return landmark.calculate(
      ...map(landmark.components, tryCalculate),
    )(
      ...map(landmark.components, tryMap),
    );
  }
  return undefined;
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
  chin: 'Chin prominence',
};

const indicationMap: Record<Indication<Category>, string> = {
  buccal: 'Buccal',
  class1: 'Class 1',
  class2: 'Class 2',
  class3: 'Class 3',
  clockwise: 'Clockwise',
  closed: 'Closed',
  concave: 'Concave',
  convex: 'Convex',
  counterclockwise: 'Counter-clockwise',
  horizontal: 'Horizontal',
  vertical: 'Vertical',
  lingual: 'Lingual',
  normal: 'Normal',
  open: 'Open',
  palatal: 'Palatal',
  prognathic: 'Prognathic',
  prominent: 'Prominent',
  recessive: 'Recessive',
  retrognathic: 'Retrognathic',
  tendency_for_class3: 'Class 3 Tendency',
};

export const getDisplayNameForCategory =
  (category: Category) => categoryMap[category];

export const getDisplayNameForIndication = 
  (indication: Indication<Category>) => indicationMap[indication];

/**
 * Determines whether a step in a cephalometric analysis can be mapped
 * to a geometrical object
 */
export function isStepAutomatic(step: CephLandmark): boolean {
  return typeof step.map === 'function';
};

/** Determines whether a step in a cephalometric analysis needs to be performed by the user  */
export const isStepManual = (step: CephLandmark) => !isStepAutomatic(step);

/** Determines whether a step in a cephalometric analysis can be computed as a numerical value */
export function isStepComputable(step: CephLandmark) {
  return typeof step.calculate === 'function';
};

/** 
 * Default implementation of Analysis.interpret.
 * Returns the falttened interpretation of each of this analysis components
 * grouped by category and resolves indication and severity with the default
 * resolving strategy.
 */
export const defaultInterpetAnalysis = (analysis: Analysis): InterpretAnalysis<Category> => {
  return (values, _) => {
    const results = flatten(
      map(analysis.components, ({ landmark: { symbol, interpret }, max, min, mean }) => {
        const value = values[symbol];
        if (
          typeof interpret === 'function' &&
          typeof value === 'number'
        ) {
          return map(
            interpret(value, min, max, mean),
            r => ({ ...r, symbol }),
          );
        } else {
          return [];
        }
      }),
    );

    return map(
      groupBy(results, r => r.category),
      (group, category: Category) => ({
        category,
        indication: resolveIndication(group),
        severity: resolveSeverity(group),
        relevantComponents: map(
          group,
          (({ symbol, value, mean, max, min }) => ({
            symbol,
            value,
            mean,
            max,
            min,
          })),
        ),
      }),
    );
  };
};

/**
 * Default implementation of CephLandmark.interpret.
 * Maps a value to one of three possible indications
 * based on the mean, maximum and minimum values.
 * For example, given a category of skeletalPattern and the ranges
 * ['class3', 'class1', 'class2'], the interpretation function should
 * indicate a Class 3 skeletal pattern given a value of -1 for ANB and
 * a mean of 2, min of 0 and maximum of 4.
 */
export function defaultInterpetLandmark<T extends Category>(
  category: T, ranges: [Indication<T>, Indication<T>, Indication<T>],
): InterpretLandmark<T> {
  return (value: number, min: number, max: number, mean?: number) => {
    let indication = ranges[1];
    let severity: Severity = 'none';
    if (value > max) {
      indication = ranges[2];
    } else if (value < min) {
      indication = ranges[0];
    }
    return [{
      category, indication, severity,
      value,
      mean: mean || (min + max) / 2,
      max, min,
    }];
  };
};

/**
 * Creates a landmark interpretation function that calls
 * any number of interpretation functions and returns a array 
 * of interpretations composed of flattening the results of
 * each function call. 
 */
export function composeInterpretation<T extends Category>(
  ...args: Array<InterpretLandmark<T>>
) {
  return (value: number, max: number, min: number) => {
    return flatten(map(args, fn => fn(value, max, min)));
  };
};

/**
 * Tries to get the most reasonable severity value given contradicting
 * interpretations of the evaluated value of a landmark by returning the 
 * most occurring severity value.
 */
export function resolveSeverity<C extends Category>(
  results: Array<LandmarkInterpretation<C>>
): Severity {
  const counts = countBy(results, r => r.severity);
  const pairs = map(counts, (value, severity: Severity) => ({ value, severity }));
  const max = maxBy(pairs, ({ value }) => value);
  return max.severity;
};

/**
 * Tries to get the most reasonable indication given contradicting
 * interpretations of the evaluated value of a landmark by returning the
 * most occurring indication.
 */
export function resolveIndication<C extends Category>(
  results: Array<LandmarkInterpretation<C>>,
): Indication<C> {
  const counts = countBy(results, r => r.indication);
  const pairs = map(
    counts,
    (value, indication: Indication<C>) => ({
      value,
      indication 
    }),
  );
  const max = maxBy(pairs, ({ value }) => value);
  return max.indication;
};
