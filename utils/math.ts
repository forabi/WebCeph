/**
 * Describes a geometrical point in a 2D-plane
 */
export interface Point {
  x: number,
  y: number,
};

export function radiansToDegrees(value: number): number {
  return value * (180 / Math.PI);
}

export function degreesToRadians(value: number): number {
  return value *  Math.PI / 180;
}

/**
 * Calculates an angle between three points
 * @return {number} angle in degrees
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 * @see https://en.wikipedia.org/wiki/Inverse_trigonometric_functions
 * @see https://en.wikipedia.org/wiki/Law_of_cosines
 */
export function calculateAngle(A: Point, B: Point, C: Point): number {
  // Calculate length of each line in the triangle formed by A, B, C.
  const AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2));    
  const BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2)); 
  const AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2));

  // Arccosine is the inverse function of a cosine, Given a cosine,
  // it calculates the corresponding angle.
  return radiansToDegrees(Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)));
};
