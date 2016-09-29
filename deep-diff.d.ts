declare module 'deep-diff' {
  export interface Diff<T> {
    /**
     * indicates the kind of change; will be one of the following:
     * 'N' = indicates a newly added property/element
     * 'D' = indicates a property/element was deleted
     * 'E' = indicates a property/element was edited
     * 'A' = indicates a change occurred within an array
     */
    kind: 'N' |'D' | 'E' |'A';
    /** The property path (from the left-hand-side root) */
    path: string[];
    /** The value on the left-hand-side of the comparison (undefined if kind === 'N') */
    lhs: T;
    /** the value on the right-hand-side of the comparison (undefined if kind === 'D') */
    rhs: T;
    /** when kind === 'A', indicates the array index where the change occurred */
    index?: number;
    /** when kind === 'A', contains a nested change record indicating the change that occurred at the array index */
    item?: Diff;
  } 

  interface Accumulator<T> {
    push(diff: Diff<T>): void;
    length: number;
  }

  interface Prefilter {
    (path: string[], key: string): boolean;
  }
  /**
   * A function that calculates the differences between two objects
   */
  declare type DiffFunction = <T>(
    /**
     * The left-hand operand; the origin object
     */
    origin: { [id: string]: T },
    /**
     * The right-hand operand; the object being compared structurally with the origin object.
     */
    target: typeof origin,
    /**
     * An optional function that determines whether difference analysis should continue down the object graph
     */
    prefilter?: Prefilter,
    /**
     * An optional accumulator/array (requirement is that it have a push function).
     * Each difference is pushed to the specified accumulator.
     */
    acc?: Accumulator<T>,
  ) => Diff<T>[];

  const diff: DiffFunction;
  export default diff;
}