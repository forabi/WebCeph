import has from 'lodash/has';

export function radiansToDegrees(value: number): number {
  return value * 180 / Math.PI;
}

export function degreesToRadians(value: number): number {
  return value *  Math.PI / 180;
}

export function isGeometricalPoint(object: any): object is GeometricalPoint {
  return has(object, 'x') && has(object, 'y');
}

export function isGeometricalLine(object: any): object is GeometricalVector {
  return has(object, 'x2') && has(object, 'y1') && has(object, 'x2') && has(object, 'y2');
}

export function isBehind(point: GeometricalPoint, line: GeometricalVector) {
  return ((line.x2 - line.x1) * (point.y - line.y1) - (line.y2 - line.y1) * (point.x - line.x1)) > 0;
} 


/**
 * Calculates distance between two points
 * @return {number} distance in pixels
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 */
export function calculateDistanceBetweenTwoPoints(A: GeometricalPoint, B: GeometricalPoint): number {
    return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
}

/**
 * Calculates an angle between three points
 * @return {number} angle in radians
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 * @see https://en.wikipedia.org/wiki/Law_of_cosines
 */
export function calculateAngleBetweenPoints(A: GeometricalPoint, B: GeometricalPoint, C: GeometricalPoint): number {
  // Calculate length of each line in the triangle formed by A, B, C.
  const AB = calculateDistanceBetweenTwoPoints(A, B);    
  const BC = calculateDistanceBetweenTwoPoints(B, C);
  const AC = calculateDistanceBetweenTwoPoints(A, C);

  // Arccosine is the inverse function of a cosine, i.e. given a cosine,
  // it calculates the corresponding angle.
  return Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB));
};

/**
 * Calculates an angle between two lines
 * @return {number} angle in radians
 * @see https://www.youtube.com/watch?v=-OMbXkhHFBQ
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 * @see http://stackoverflow.com/a/3366577/1582641
 */
export function calculateAngleBetweenTwoLines(line1: GeometricalVector, line2: GeometricalVector): number {
  const { x1, x2, y1, y2 } = line1;
  const { x1: x3, x2: x4, y1: y3, y2: y4 } = line2;
  const dx1 = x2 - x1;
  const dy1 = y2 - y1;
  const dx2 = x4 - x3;
  const dy2 = y4 - y3;

  const d = dx1 * dx2 + dy1 * dy2;   // dot product of the 2 vectors
  const l2 = (dx1 ** 2 + dy1 ** 2) * (dx2 ** 2 + dy2 ** 2); // product of the squared lengths

  return Math.acos(d / Math.sqrt(l2));
}