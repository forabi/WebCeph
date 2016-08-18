import _ = require('lodash');

export type AngularUnit = 'degree' | 'radian';
export type LinearUnit = 'mm' | 'cm' | 'in';
export type LandmarkType = 'angle' | 'point' | 'line'; 

export interface Landmark {
  name: string,
  symbol: string,
  type: LandmarkType,
  unit?: AngularUnit | LinearUnit,
  components: Array<Landmark>,
  calculate?(...args: Array<number>): number,
}

export interface Point extends Landmark {
  name: string,
  symbol: string,
  type: 'point',
}

export interface Line extends Landmark {
  name: string,
  type: 'line',
  unit: LinearUnit,
  components: Array<Point>
}

export interface Angle extends Landmark {
    name: string;
    type: 'angle';
    unit: AngularUnit;
    components: Array<Line>
}

export function getSymbolForAngle(lineA: Line, lineB: Line): string {
    return 'Angle ' + _.uniq([
      lineA.components[0].symbol,
      lineA.components[1].symbol,
      lineB.components[0].symbol,
      lineB.components[1].symbol,
    ]).join('');
}

export function angleBetweenLines(lineA: Line, lineB: Line, name: string, unit: AngularUnit = 'degree'): Angle {
  return {
      type: 'angle', name, unit,
      symbol: getSymbolForAngle(lineA, lineB),
      components: [lineA, lineB],
  }; 
}

export function angleBetweenPoints(A: string, B: string, C: string, name: string = null, unit: AngularUnit = 'degree'): Angle {
  return angleBetweenLines(line(A, B), line(B, C), name, unit);
}

export function point(symbol: string, name: string = null): Point {
  return {
    name,
    symbol,
    type: 'point',
    components: [],
  }
}

export function line(A: string, B: string, name: string = null, unit: LinearUnit = 'mm'): Line {
  return {
    name,
    unit,
    symbol: `${A}-${B}`,
    type: 'line',
    components: [
      point(A),
      point(B),
    ],
  };
}

export type Analysis = Array<{ landmark: Landmark, norm: number, stdDev?: number }>;


const hasComponents: (m: Landmark) => boolean = m => m.components.length > 0;

export function getStepsForLandmark(landmark: Landmark): Landmark[] {
    if (!hasComponents(landmark)) return [landmark];
    return <Landmark[]>(
        _.chain(landmark.components)
            .map(c => _.flatMap(c.components, getStepsForLandmark))
            .flatten().uniqBy('symbol').value()
    );
}

export function getStepsForAnalysis(analysis: Analysis): Landmark[] {
    return <Landmark[]>(
        _.chain(analysis)
            .map(l => l.landmark)
            .map(getStepsForLandmark)
            .flatten()
            .compact()
            .uniqBy('symbol')
            .value()
    );
}

import {
    calculateAngleBetweenLines,
    calculateDistanceBetweenTwoPoints,
    Line as GeometricalLine,
    Point as GeometricalPoint,
    radiansToDegrees,
    degreesToRadians,
} from '../utils/math';

interface Mapper {
    toLine(landmark): GeometricalLine;
    toPoint(landmark): GeometricalPoint;
    scaleFactor: number;
}

export function calculate(landmark: Landmark, mapper: Mapper): number {
    if (landmark.calculate) {
        return landmark.calculate.apply(
            landmark, 
            landmark.components.map(l => calculate(l, mapper))
        );
    } else if (landmark.type === 'angle') {
        const lines: GeometricalLine[] = landmark.components.map(mapper.toLine);
        const result = calculateAngleBetweenLines(lines[0], line[1]);
        return landmark.unit === 'degree' ? radiansToDegrees(result) : result;
    } else if (landmark.type === 'line') {
        const points = (<Line>landmark).components.map(mapper.toPoint);
        // @TODO: figure out how to use units?
        const result = calculateDistanceBetweenTwoPoints(points[0], points[1]) * mapper.scaleFactor;
    } else {
        throw new TypeError(`Landmarks of this type (${landmark.type}) cannot be calculated`);
    }
}