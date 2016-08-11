export type AngularUnit = 'degree' | 'radian';
export type LinearUnit = 'mm' | 'cm' | 'in';
export type MeasurementType = 'angle' | 'linear' | 'coordinate' | 'line'; 

import { Angle } from './angle';

export interface Measurement {
  name: string,
  symbol: string,
  type: MeasurementType,
  unit?: AngularUnit | LinearUnit,
  components?: Array<Measurement>,
  calculate?(): number,
}

export interface Point {
  name: string,
  symbol: string,
  type: 'coordinate',
}

export interface Line extends Measurement {
  name: string,
  type: 'line',
  components: Array<Point>
}

export function angleBetweenPoints(A: string, B: string, C: string, name: string = null, unit: AngularUnit = 'degree'): Angle {
  const a = new Angle(name, unit);
  a.components = [line(A, B), line(B, C)];
  return a;
}

export function angleBetweenLines(lineA: Line, lineB: Line, name: string, unit: AngularUnit = 'degree'): Angle {
  const a = new Angle(name, unit);
  a.components = [lineA, lineB];
  return a; 
}

export function point(symbol: string, name: string = null): Point {
  return {
    name,
    symbol,
    type: 'coordinate',
  }
}

export function line(A: string, B: string, name: string = null): Line {
  return {
    name,
    symbol: `${A}-${B}`,
    type: 'line',
    components: [
      point(A),
      point(B),
    ],
  };
}

export type Analysis = Array<{ measurment: Measurement, norm: number, stdDev?: number }>;