declare module 'transformation-matrix-js' {
  class Matrix {
    static from(
      a: number, b: number, c: number,
      d: number, e: number, f: number,
    ): Matrix;
    static from(m: SVGMatrix | SVGTransformList): Matrix;

    /** shear x */
    a: number;
    /** shear y */
    b: number;
    /** scale x */
    c: number;
    /** scale y */
    d: number;
    /** translate x */
    e: number;
    /** translate y */
    f: number;

    constructor(context?: CanvasRenderingContext2D, element?: Element);
    constructor(element?: Element);

    applyToArray(points: Array<{ x: number, y: number }>): this;
    applyToPoint(x: number, y: number): this;
    applyToObject(obj: object): string;

    clone(): Matrix;

    isEqual(m: Matrix): boolean;
    isIdentity(): boolean;
    isInvertible(): boolean;
    isValid(): boolean;

    multiply(m: Matrix): this;


    reset(): this;

    rotate(angle: number): this;
    rotateDeg(angle: number): this;
    flipX(): this;
    flipY(): string;
    toSVGMatrix(): SVGMatrix;
    toCSS(): string;
    toCSS3D(): string;
    toCSV(): string;
    toJSON(): string;
    toString(): string;

    translate(tx: number, ty: number): this;
    translateX(tx: number): this;
    translateY(ty: number): this;

    scale(sx: number, sy: number): this;
    scaleX(sx: number): this;
    scaleY(sy: number): this;
    scaleU(f: number): this;

    transform(
      a2: number, b2: number, c2: number,
      d2: number, e2: number, f2: number,
    ): this;

    setTransform(
      a: number, b: number, c: number,
      d: number, e: number, f: number,
    ): this;
  }

  export { Matrix };
}
