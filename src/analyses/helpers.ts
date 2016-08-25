import flatten from 'lodash/flatten';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import filter from 'lodash/filter';
import reject from 'lodash/reject';
import concat from 'lodash/concat';

export type AngularUnit = 'degree' | 'radian';
export type LinearUnit = 'mm' | 'cm' | 'in';
export type LandmarkType = 'angle' | 'point' | 'line'; 

/**
 * A generic interface that represents any cephalometric radiograph, including
 * angles, lines and points.
 * Landmarks may also have names and units.
 */
export interface Landmark {
  name?: string,
  /**
   * Each landmark must have a symbol which acts as the unique identifier for that landmark.
   */
  symbol: string,
  description?: string,
  type: LandmarkType,
  unit?: AngularUnit | LinearUnit,
  /**
   * Some landmarks are composed of more basic components; for example, a line is
   * composed of two points.
   */
  components: Landmark[],
  /**
   * An optional custom calculation method.
   * It is passed the computed values for each of this landmark's components
   * in the same order they were declared.
   */
  calculate?(...args: number[]): number,
}

export interface Point extends Landmark {
  type: 'point',
}

export interface Line extends Landmark {
  type: 'line',
  unit: LinearUnit,
  components: Point[],
}

export interface Angle extends Landmark {
    type: 'angle';
    unit: AngularUnit;
    components: Line[]
}

export function getSymbolForAngle(lineA: Line, lineB: Line): string {
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
export function angleBetweenLines(lineA: Line, lineB: Line, name?: string, symbol?: string, unit: AngularUnit = 'degree'): Angle {
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
export function angleBetweenPoints(A: Point, B: Point, C: Point, name?: string, unit: AngularUnit = 'degree'): Angle {
  return angleBetweenLines(line(A, B), line(B, C), name, undefined, unit);
}

export function point(symbol: string, name?: string, description?: string): Point {
  return {
    name,
    symbol,
    description,
    type: 'point',
    components: [],
  }
}

/**
 * Creates an object conforming to the Line interface connecting two points
 */
export function line(A: Point, B: Point, name?: string, symbol?: string, unit: LinearUnit = 'mm'): Line {
  return {
    name,
    unit,
    symbol: symbol || `${A.symbol}-${B.symbol}`,
    type: 'line',
    components: [A, B],
  };
}

export type Analysis = Array<{ landmark: Landmark, norm: number, stdDev?: number }>;

const hasComponents: (m: Landmark) => boolean = m => m.components.length > 0;

export function getEdgesForLandmark(l: Landmark): Landmark[][] {
    const edges: Landmark[][] = [];
    if (!hasComponents(l)) {
            edges.push([l]);
    } else {
        edges.unshift([...l.components, l]);
        for (const c of l.components) {
            const subedges = getEdgesForLandmark(c);
            edges.unshift(
                concat(
                    ...subedges,
                    [...c.components, c],
                )
            );
        }
    }
    return edges.map(uniq);
}

export function getStepsForLandmarks(landmarks: Landmark[]): Landmark[] {
    const edges: Landmark[][] = flatten(landmarks.map(getEdgesForLandmark));
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

export function getStepsForAnalysis(analysis: Analysis): Landmark[] {
    return getStepsForLandmarks(analysis.map(c => c.landmark));
}

import {
    calculateAngleBetweenTwoLines,
    calculateDistanceBetweenTwoPoints,
    Line as GeometricalLine,
    Point as GeometricalPoint,
    radiansToDegrees,
} from '../utils/math';

/**
 * A Mapper object maps cephalometric landmarks to geometrical objects
 */
interface Mapper {
    toLine(landmark: Line): GeometricalLine;
    toPoint(landmark: Point): GeometricalPoint;
    /**
     * The scale factor is required to calculate linear measurements
     * It is expected to map pixels on the screen to millimeters.
     */
    scaleFactor: number;
}

/**
 * Calculates the value of a landmark on a cephalometric radiograph
 * 
 */
export function calculate(landmark: Landmark, mapper: Mapper): number {
    if (landmark.calculate) {
        return landmark.calculate.apply(
            landmark, 
            landmark.components.map(l => calculate(l, mapper))
        );
    } else if (landmark.type === 'angle') {
        const lines: GeometricalLine[] = (<Angle>landmark).components.map(mapper.toLine);
        const result = calculateAngleBetweenTwoLines(lines[0], lines[1]);
        return landmark.unit === 'degree' ? radiansToDegrees(result) : result;
    } else if (landmark.type === 'line') {
        const points: GeometricalPoint[] = (<Line>landmark).components.map(mapper.toPoint);
        const result = calculateDistanceBetweenTwoPoints(points[0], points[1]) * mapper.scaleFactor;
        const unit = (<Line>landmark).unit;
        return unit === 'mm' ? result : unit === 'cm' ? result / 10 : result / 25.4;
    } else {
        throw new TypeError(`Landmarks of this type (${landmark.type}) cannot be calculated`);
    }
}