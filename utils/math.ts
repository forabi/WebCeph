/**
 * Describes a geometrical point in a 2D-plane
 */
export interface Point {
  x: number,
  y: number,
};

export interface Line {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

export function radiansToDegrees(value: number): number {
  return value * (180 / Math.PI);
}

export function degreesToRadians(value: number): number {
  return value *  Math.PI / 180;
}

/**
 * Calculates an angle between three points
 * @return {number} angle in radians
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 * @see https://en.wikipedia.org/wiki/Law_of_cosines
 */
export function calculateAngleBetweenPoints(A: Point, B: Point, C: Point): number {
  // Calculate length of each line in the triangle formed by A, B, C.
  const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));    
  const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2)); 
  const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));

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
 */
export function calculateAngleBetweenLines(line1: Line, line2: Line): number {
  const angle1 = Math.atan2(line1.y1 - line1.y2, line1.x1 - line1.x2);
  const angle2 = Math.atan2(line2.y1 - line2.y2, line2.x1 - line2.x2);
  return angle1 - angle2;
}