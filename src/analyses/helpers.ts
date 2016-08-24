import * as _ from 'lodash';

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
  name?: string,
  symbol: string,
  type: 'point',
}

export interface Line extends Landmark {
  name?: string,
  type: 'line',
  unit: LinearUnit,
  components: Point[]
}

export interface Angle extends Landmark {
    name?: string;
    type: 'angle';
    unit: AngularUnit;
    components: Line[]
}

export function getSymbolForAngle(lineA: Line, lineB: Line): string {
    return _.uniq([
      lineA.components[0].symbol,
      lineA.components[1].symbol,
      lineB.components[0].symbol,
      lineB.components[1].symbol,
    ]).join('');
}

/**
 * Creates an object conforming to the Angle interface based on 2 lines
 */
export function angleBetweenLines(lineA: Line, lineB: Line, name: string | undefined = undefined, unit: AngularUnit = 'degree'): Angle {
  const symbol = getSymbolForAngle(lineA, lineB);
  return {
      type: 'angle', symbol, unit,
      name: name || `Angle ${symbol}`, 
      components: [lineA, lineB],
  }; 
}

/**
 * Creates an object conforming to the Angle interface based on 3 points
 */
export function angleBetweenPoints(A: Point, B: Point, C: Point, name: string | undefined = undefined, unit: AngularUnit = 'degree'): Angle {
  return angleBetweenLines(line(A, B), line(B, C), name, unit);
}

export function point(symbol: string, name: string | undefined = undefined): Point {
  return {
    name,
    symbol,
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
                _.concat(
                    ...subedges,
                    [...c.components, c],
                )
    );
        }
    }
    return edges.map(_.uniq);
}

export function getStepsForLandmarks(landmarks: Landmark[]): Landmark[] {
    const edges: Landmark[][] = _.flatten(landmarks.map(getEdgesForLandmark));
    const store = new Map;
    const uniqueEdges = _.filter(_.map(
        edges,
        a => _.reject(a, e => {
            if (store.has(e.symbol)) {
                return true;
            } else {
                store.set(e.symbol, e);
                return false;
            }
        }).map(l => l.symbol)
    ), 'length');
    return _.flatten(uniqueEdges).map(symbol => store.get(symbol));
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
    degreesToRadians,
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