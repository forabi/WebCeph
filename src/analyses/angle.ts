import { Point, Line, Measurement, MeasurementType, AngularUnit } from './helpers';
import { calculateAngleBetweenPoints, calculateAngleBetweenLines, radiansToDegrees } from '../utils/math';
import { uniq } from 'lodash';

export class Angle implements Measurement {
  type: MeasurementType = 'angle';
  unit: AngularUnit;
  components: Array<Line>
  name: string;

  constructor(name: string = null, unit: AngularUnit = 'degree') {
    this.name = name;
    this.unit = unit;
  }

  get symbol(): string {
    return uniq([
      this.components[0].components[0].symbol,
      this.components[0].components[1].symbol,
      this.components[1].components[0].symbol,
      this.components[2].components[0].symbol,
    ]).join('');
  }

  calculate() {
    const result = calculateAngleBetweenLines.apply(null, this.components);
    return this.unit === 'degree' ? radiansToDegrees(result) : result;
  }
}