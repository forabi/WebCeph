export type AngularUnit = 'degree' | 'radian';
export type LinearUnit = 'mm' | 'cm' | 'in';
export type MeasurementType = 'angle' | 'linear' | 'coordinate' | 'line'; 

import { Angle } from './angle';

export interface Measurement {
  name: string,
  symbol: string,
  type: MeasurementType,
  unit?: AngularUnit | LinearUnit,
  components: Array<Measurement>,
  calculate?(): number,
}

export interface Point extends Measurement {
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
    components: [],
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

export type Analysis = Array<{ measurement: Measurement, norm: number, stdDev?: number }>;

import _ = require('lodash');

const hasComponents: (Measurement) => boolean = m => m.components.length > 0;

export function getStepsForMeasurement(measurement: Measurement): Array<Measurement>{
    if (!hasComponents(measurement)) return [measurement];
    return _.chain(measurement.components)
     .map(c => _.flatMap(c.components, getStepsForMeasurement))
     .flatten().uniqBy('symbol').value();
}

export function getStepsForAnalysis(analysis: Analysis): Array<Measurement> {
    return _.chain(analysis)
     .map('measurement')
     .map(getStepsForMeasurement)
     .flatten()
     .compact()
     .uniqBy('symbol')
     .value();
}