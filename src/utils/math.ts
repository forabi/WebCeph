import has from 'lodash/has';
import each from 'lodash/each';
import clamp from 'lodash/clamp';

export function radiansToDegrees(value: number): number {
  return value * 180 / Math.PI;
};

export function degreesToRadians(value: number): number {
  return value *  Math.PI / 180;
};

/** Checks whether an object conforms to the GeometricalPoint interface */
export function isGeoPoint(object: any): object is GeoPoint {
  return has(object, 'x') && has(object, 'y');
};

/** Checks whether an object conforms to the GeometricalVector interface */
export function isGeoVector(object: any): object is GeoVector {
  return has(object, 'x2') && has(object, 'y1') && has(object, 'x2') && has(object, 'y2');
};

/** Checks whether an object conforms to the GeometricalVector interface */
export function isGeoAngle(object: any): object is GeoAngle {
  return has(object, 'vectors') && object.vectors.length === 2 && each(object.vectors, isGeoVector);
};

export function isGeoObject(object: any): object is GeoObject {
  return isGeoPoint(object) || isGeoVector(object) || isGeoAngle(object);
};

export function isBehind(point: GeoPoint, line: GeoVector) {
  return ((line.x2 - line.x1) * (point.y - line.y1) - (line.y2 - line.y1) * (point.x - line.x1)) > 0;
};

export function getSegmentLength({ x1, x2, y1, y2 }: GeoVector) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2;
};

/**
 * Calculates distance between two points
 * @return {number} distance in pixels
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 */
export function calculateDistanceBetweenTwoPoints(A: GeoPoint, B: GeoPoint): number {
    return Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));
};

/**
 * Calculates an angle between three points
 * @return {number} angle in radians
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 * @see https://en.wikipedia.org/wiki/Law_of_cosines
 */
export function calculateAngleBetweenPoints(A: GeoPoint, B: GeoPoint, C: GeoPoint): number {
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
export function calculateAngleBetweenTwoVectors(line1: GeoVector, line2: GeoVector): number {
  const { x1, x2, y1, y2 } = line1;
  const { x1: x3, x2: x4, y1: y3, y2: y4 } = line2;
  const dx1 = x2 - x1;
  const dy1 = y2 - y1;
  const dx2 = x4 - x3;
  const dy2 = y4 - y3;

  const d = dx1 * dx2 + dy1 * dy2; // Dot product of the 2 vectors
  const l2 = (dx1 ** 2 + dy1 ** 2) * (dx2 ** 2 + dy2 ** 2); // Product of the squared lengths

  return Math.acos(d / Math.sqrt(l2));
};

export function calculateAngle({ vectors: [v1, v2] }: GeoAngle) {
  return calculateAngleBetweenTwoVectors(v1, v2);
}

/** Rotate a point in a 2-D plane given an origin and an angle */
export function rotatePointAroundOrigin(
  /**
   * The central point (the origin around which the second point will be rotated)
   */
  { x: cx, y: cy }: GeoPoint,
  { x, y }: GeoPoint,
  angleInRadians: number,
): GeoPoint {
  const cos = Math.cos(angleInRadians);
  const sin = Math.sin(angleInRadians);
  const nx = (cos * (x - cx)) + (sin * (y - cy)) + cx;
  const ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return { x: nx, y: ny };
}

export interface Rect {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

export const isPointWithinRect = ({ x, y }: GeoPoint, { top, left, bottom, right }: Rect) => {
  return (
    clamp(x, left, right) === x &&
    clamp(y, top, bottom) === y
  );
};

export const getSlope = ({ x1, y1, x2, y2 }: GeoVector) => (y2 - y1) / (x2 - x1);

export const getYInterceptEquation = (vector: GeoVector) => {
  const { x1, y1 } = vector;
  return (x: number) => getSlope(vector) * (x - x1) + y1;
};

export const isPointInLine = (
  { x, y }: GeoPoint,
  vector: GeoVector,
) => {
  const getY = getYInterceptEquation(vector);
  return getY(x) === y;
};

export const isPointInSegment = (
  point: GeoPoint,
  vector: GeoVector,
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

export const getABCForLine = ({ x1, y1, x2, y2 }: GeoVector) => {
  const A = y2 - y1;
  const B = x1 - x2;
  const C = (A * x1) + (B * y1);
  return { A, B, C };
};

export const getIntersectionPoint = (
  vector1: GeoVector,
  vector2: GeoVector,
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


export const getVectorPoints = ({ x1, y1, x2, y2 }: GeoVector): [GeoPoint, GeoPoint] => {
  return [
    { x: x1, y: y1 },
    { x: x2, y: y2 },
  ];
};

export const createVectorFromPoints = (point1: GeoPoint, point2: GeoPoint): GeoVector => {
  return {
    x1: point1.x,
    y1: point1.y,
    x2: point2.x,
    y2: point2.y,
  };
};

export const createAngleFromVectors = (vector1: GeoVector, vector2: GeoVector): GeoAngle => {
  return {
    vectors: [vector1, vector2],
  }
};

export const createPerpendicular = (
  { x1, y1, x2, y2 }: GeoVector,
  point: GeoPoint,
): GeoVector => {
  const k = (
    (y2 - y1) * (point.x - x1) - (x2 - x1) * (point.y - y1)
  ) / (
    (y2 - y1) ** 2 + (x2 - x1) ** 2
  );
  const x = point.x - k * (y2 - y1);
  const y = point.y + k * (x2 - x1);
  return createVectorFromPoints(point, { x, y });
};

export const createParallel = (
  vector: GeoVector, origin: GeoPoint, x2: number
): GeoVector => {
  const slope = getSlope(vector);
  const intercept = origin.y - (slope * origin.x);
  const y2 = (slope * x2) + intercept;
  return createVectorFromPoints(origin, { x: x2, y: y2 });
};
