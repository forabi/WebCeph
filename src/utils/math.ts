import has from 'lodash/has';
import each from 'lodash/each';

export function radiansToDegrees(value: number): number {
  return value * 180 / Math.PI;
};

export function degreesToRadians(value: number): number {
  return value *  Math.PI / 180;
};

/** Checks whether an object conforms to the GeometricalPoint interface */
export function isGeometricalPoint(object: any): object is GeometricalPoint {
  return has(object, 'x') && has(object, 'y');
};

/** Checks whether an object conforms to the GeometricalVector interface */
export function isGeometricalVector(object: any): object is GeometricalVector {
  return has(object, 'x2') && has(object, 'y1') && has(object, 'x2') && has(object, 'y2');
};

/** Checks whether an object conforms to the GeometricalVector interface */
export function isGeometricalAngle(object: any): object is GeometricalAngle {
  return has(object, 'vectors') && object.vectors.length === 2 && each(object.vectors, isGeometricalVector);
};

export function isGeometricalObject(object: any): object is GeometricalObject {
  return isGeometricalPoint(object) || isGeometricalVector(object) || isGeometricalAngle(object);
};

export function isBehind(point: GeometricalPoint, line: GeometricalVector) {
  return ((line.x2 - line.x1) * (point.y - line.y1) - (line.y2 - line.y1) * (point.x - line.x1)) > 0;
};

export function getSegmentLength({ x1, x2, y1, y2 }: GeometricalVector) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
};

/**
 * Calculates distance between two points
 * @return {number} distance in pixels
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 */
export function calculateDistanceBetweenTwoPoints(A: GeometricalPoint, B: GeometricalPoint): number {
    return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
};

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
export function calculateAngleBetweenTwoVectors(line1: GeometricalVector, line2: GeometricalVector): number {
  const { x1, x2, y1, y2 } = line1;
  const { x1: x3, x2: x4, y1: y3, y2: y4 } = line2;
  const dx1 = x2 - x1;
  const dy1 = y2 - y1;
  const dx2 = x4 - x3;
  const dy2 = y4 - y3;

  const d = dx1 * dx2 + dy1 * dy2;   // dot product of the 2 vectors
  const l2 = (dx1 ** 2 + dy1 ** 2) * (dx2 ** 2 + dy2 ** 2); // product of the squared lengths

  return Math.acos(d / Math.sqrt(l2));
};


import clamp from 'lodash/clamp';

export interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const isPointWithinRect = ({ x, y }: GeometricalPoint, { top, left, bottom, right }: Rect) => {
  return (
    clamp(x, left, right) === x &&
    clamp(y, top, bottom) === y
  );
};

export const getSlope = ({ x1, y1, x2, y2 }: GeometricalVector) => (y2 - y1) / (x2 - x1);

export const getYInterceptEquation = (vector: GeometricalVector) => {
  const { x1, y1 } = vector;
  return (x: number) => getSlope(vector) * (x - x1) + y1;
};

export const isPointCloserTo = (
  _: GeometricalPoint,
  __: GeometricalVector,
  ___: GeometricalVector,
) => {
  return false; // @TODO
};

export const isPointInLine = (
  { x, y }: GeometricalPoint,
  vector: GeometricalVector,
) => {
  const getY = getYInterceptEquation(vector);
  return getY(x) === y;
};

export const isPointInSegment = (
  point: GeometricalPoint,
  vector: GeometricalVector,
) => {
  const { x1, y1, x2, y2 } = vector;
  const maxY = Math.max(y1, y2);
  const minY = Math.min(y1, y2);
  const maxX = Math.max(x1, x2);
  const minX = Math.min(x1, x2);
  return (
    point.x >= minX && point.x <= maxX &&
    point.y >= minY && point.y <= maxY
  ) && isPointInLine(point, vector);
};

export const getABCForLine = ({ x1, y1, x2, y2 }: GeometricalVector) => {
  const A = y2 - y1;
  const B = x1 - x2;
  const C = (A * x1) + (B * y1);
  return { A, B, C };
};

export const getIntersectionPoint = (
  vector1: GeometricalVector,
  vector2: GeometricalVector,
) => {
  const { A: A1, B: B1, C: C1 } = getABCForLine(vector1);
  const { A: A2, B: B2, C: C2 } = getABCForLine(vector2);
  const det = A1 * B2 - A2 * B1;
  if (det === 0) {
    return undefined;
  } else {
    const x = (B2 * C1 - B1 * C2) / det;
    const y = (A1 * C2 - A2 * C1) / det;
    return { x, y };
  }
};

export const getVectorPoints = ({ x1, y1, x2, y2 }: GeometricalVector): [GeometricalPoint, GeometricalPoint] => {
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
};

export const createVectorFromPoints = (point1: GeometricalPoint, point2: GeometricalPoint): GeometricalVector => {
  return {
    x1: point1.x,
    y1: point1.y,
    x2: point2.x,
    y2: point2.y,
  };
};
