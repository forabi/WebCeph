import flatten from 'lodash/flatten';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';
import reject from 'lodash/reject';
import concat from 'lodash/concat';
import assign from 'lodash/assign';
import has from 'lodash/has';
import every from 'lodash/every';
import join from 'lodash/join';
import reduce from 'lodash/reduce';

export function getSymbolForAngle(lineA: CephaloLine, lineB: CephaloLine): string {
  return uniq([
    lineA.components[0].symbol,
    lineA.components[1].symbol,
    lineB.components[0].symbol,
    lineB.components[1].symbol,
  ]).join('');
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
  return assign(
    angleBetweenLines(line(A, B), line(B, C), name, undefined, unit),
    {
      calculate: (line1: GeometricalLine, line2: GeometricalLine) => {
        const p1 = { x: line1.x1, y: line1.y1 };
        const p2 = { x: line1.x2, y: line1.y2 };
        const p3 = { x: line2.x2, y: line2.y2 };
        const result = calculateAngleBetweenPoints(p1, p2, p3);
        return unit === 'degree' ? radiansToDegrees(result) : result;
      },
    },
  );
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

const hasComponents: (m: CephaloLandmark) => boolean = m => m.components.length > 0;

export function getEdgesForLandmark(l: CephaloLandmark): CephaloLandmark[][] {
  const edges: CephaloLandmark[][] = [];
  if (!hasComponents(l)) {
    edges.push([l]);
  } else {
    for (const c of l.components) {
      const subedges = getEdgesForLandmark(c);
      edges.push(
        concat(
            ...subedges,
            [...c.components, c],
        ),
      );
    }
    edges.push([...l.components, l]);
  }
  return edges.map(uniq);
}

export function getStepsForLandmarks(landmarks: CephaloLandmark[]): CephaloLandmark[] {
  const edges: CephaloLandmark[][] = flatten(landmarks.map(getEdgesForLandmark));
  const store = new Map;
  const uniqueEdges = filter(map(
    edges,
    a => reject(a, (e => {
        if (store.has(e.symbol)) {
            return true;
        } else {
            store.set(e.symbol, e);
            return false;
        }
    })).map(l => l.symbol)
  ), 'length');
  return flatten(uniqueEdges).map(symbol => store.get(symbol));
}

export function getStepsForAnalysis(analysis: Analysis): CephaloLandmark[] {
  return getStepsForLandmarks(analysis.components.map(c => c.landmark));
}

import {
  calculateAngleBetweenTwoLines,
  calculateAngleBetweenPoints,
  calculateDistanceBetweenTwoPoints,
  radiansToDegrees,
} from '../utils/math';

/**
 * Calculates the value of a landmark on a cephalometric radiograph
 * 
 */
export function evaluate(landmark: CephaloLandmark, mapper: CephaloMapper): EvaluatedValue | undefined {
  if (landmark.calculate) {
    return landmark.calculate.apply(
      landmark, 
      map(landmark.components, l => evaluate(l, mapper))
    );
  } else if (landmark.type === 'angle') {
    let result: number;
    if (landmark.components[0].type === 'point') {
      const points: GeometricalPoint[] = map(landmark.components as CephaloPoint[], mapper.toPoint);
      result = calculateAngleBetweenPoints(points[0], points[1], points[2]);
    } else {
      const lines: GeometricalLine[] = map(landmark.components as CephaloLine[], mapper.toLine);
      result = calculateAngleBetweenTwoLines(lines[0], lines[1]);
    }
    return landmark.unit === 'degree' ? radiansToDegrees(result) : result;
  } else if (landmark.type === 'distance') {
    const points: GeometricalPoint[] = map(landmark.components, mapper.toPoint);
    const result = calculateDistanceBetweenTwoPoints(points[0], points[1]) * mapper.scaleFactor;
    const unit = landmark.unit;
    return unit === 'mm' ? result : unit === 'cm' ? result / 10 : result / 25.4;
  } else if (landmark.type === 'line') {
    return mapper.toLine(landmark);
  } else if (landmark.type === 'point') {
    return mapper.toPoint(landmark);
  } else if (landmark.type === 'sum') {
    return reduce(landmark.components, (sum, t) => sum + (evaluate(t, mapper) as number), 0);
  }
  return undefined;
}

export enum SkeletalPattern {
  class1 = 0,
  class2,
  class3,
}

export enum Maxilla {
  prognathic = 3,
  retrognathic,
  /** Indicates the maxilla is neither retrognathic nor prognathic */
  normal,
}

export enum Mandible {
  // Mandible
  prognathic = 6,
  retrognathic,
  /** Indicates the mandible is neither retrognathic nor prognathic */
  normal,
}

export enum SkeletalProfile {
  normal = 9,
  concave,
  convex,
}

export enum MandibularRoation {
  normal = 12,
  clockwise,
  vertical = clockwise,
  counterClockwise,
  horizontal = counterClockwise,
}

export enum GrowthPattern {
  normal = 15,
  clockwise,
  vertical = clockwise,
  counterClockwise,
  horizontal = counterClockwise,
}
const typeMap = {
  [SkeletalPattern.class1]: 'Class I',
  [SkeletalPattern.class2]: 'Class II',
  [SkeletalPattern.class3]: 'Class III',
  [SkeletalProfile.concave]: 'Concave',
  [SkeletalProfile.convex]: 'Convex',
  [SkeletalProfile.normal]: 'Normal',
  [Maxilla.normal]: 'Normal',
  [Maxilla.prognathic]: 'Prognathic',
  [Maxilla.retrognathic]: 'Retrognathic',
  [Mandible.normal]: 'Normal',
  [Mandible.prognathic]: 'Prognathic',
  [Mandible.retrognathic]: 'Retrognathic',
  [MandibularRoation.clockwise]: 'Clockwise',
  [MandibularRoation.counterClockwise]: 'Counter-clockwise',
  [MandibularRoation.normal]: 'Normal',
  [GrowthPattern.clockwise]: 'Vertical',
  [GrowthPattern.counterClockwise]: 'Horizontal',
  [GrowthPattern.normal]: 'Normal',
}

export enum AnalysisResultSeverity {
  NONE = 0,
  UNKNOWN = NONE,
  LOW = 1,
  SLIGHT = LOW,
  MEDIUM = 2,
  HIGH = 3,
  SEVERE = HIGH,
}

export function isSkeletalPattern(value: number | string): value is SkeletalPattern {
  return has(SkeletalPattern, value);
}

export function isMaxilla(value: number | string): value is Maxilla {
  return has(Maxilla, value);
}

export function isMandible(value: number | string): value is Mandible {
  return has(Mandible, value);
}

export function isSkeletalProfile(value: number | string): value is SkeletalProfile {
  return has(SkeletalProfile, value);
}

export function isMandiblularRotation(value: number | string): value is MandibularRoation {
  return has(MandibularRoation, value);
}

export function isGrowthPattern(value: number | string): value is MandibularRoation {
  return has(GrowthPattern, value);
}

const severityMap = {
  [AnalysisResultSeverity.LOW]: 'Slight',
  [AnalysisResultSeverity.MEDIUM]: 'Medium',
  [AnalysisResultSeverity.HIGH]: 'Severe',
}

export function mapSeverityToString(value: number) {
  return severityMap[value] || '-';
}

export function mapTypeToIndication(value: number) {
  return typeMap[value] || '-';
}

export function hasResultValue(result: any): result is ViewableAnalysisResultWithValue {
  return (result as ViewableAnalysisResultWithValue).relevantComponents !== undefined;
}

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
}
export const isStepManual = (step: CephaloLandmark) => !isStepAutomatic(step);