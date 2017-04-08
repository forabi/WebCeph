declare module 'transformation-matrix' {
  type Matrix = {
    a: number;
    b: number;
    c: number;
    d: number;
    e: number;
    f: number;
  };
  type Point = { x: number, y: number };
  /** Calculate a point transformed with an affine matrix */
  export function applyToPoint(matrix: Matrix, point: Point): Point;
  /** Calculate an array of points transformed with an affine matrix */
  export function applyToPoints(matrix: Matrix, points: Point[]): Point[];
  /**
   * Extract an affine matrix from an object that contains a,b,c,d,e,f keys.
   * Each value could be a float or a string that contains a float
   */
  export function fromObject(object: {
    a: string | number;
    b: string | number;
    c: string | number;
    d: string | number;
    e: string | number;
    f: string | number;
  }): Matrix;
  /** Parse a string matrix formatted as matrix(a,b,c,d,e,f) */
  export function fromString(str: string): Matrix;
  /** Identity matrix */
  export function identity(): Matrix;
  /** Calculate a matrix that is the inverse of the provided matrix */
  export function inverse(matrix: Matrix): Matrix;
  /** Check if the object contain an affine matrix */
  export function isAffineMatrix(obj: object): boolean;
  /** Calculate a rotation matrix */
  export function rotate(angle: number): Matrix;
  /** Calculate a rotation matrix with a DEG angle */
  export function rotateDEG(angle: number): Matrix;
  /** Calculate a scaling matrix */
  export function scale(sx: number, sy: number): Matrix;
  /** Serialize the matrix to a string that can be used with CSS or SVG */
  export function toSVG(matrix: Matrix): string;
  /** Serialize the matrix to a string that can be used with CSS or SVG */
  export function toCSS(matrix: Matrix): string;
  /** Serialize the matrix to a string that can be used with CSS or SVG */
  export function toString(matrix: Matrix): string;
  /** Merge multiple matrices into one */
  export function transform(...matrices: Matrix[]): Matrix;
  /** Calculate a translate matrix */
  export function translate(tx: number, ty: number): Matrix;
}
