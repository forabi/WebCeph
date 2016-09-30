declare module 'deep-diff' {

  export interface BaseDiff<T> {
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
  }

  export interface NewDiff<T> extends BaseDiff<T> {
    kind: 'N';
    /** The value on the right-hand-side of the comparison (undefined if kind === 'D') */
    rhs: T;
  }

  export interface EditDiff<T> extends BaseDiff<T> {
    kind: 'E';
    /** The value on the left-hand-side of the comparison (undefined if kind === 'N') */
    lhs: T;
    rhs: T;
  }

  export interface DeleteDiff<T> extends BaseDiff<T> {
    kind: 'D';
    /** The value on the left-hand-side of the comparison (undefined if kind === 'N') */
    lhs: T;
  }

  export interface ArrayDiff<T> extends BaseDiff<T> {
    kind: 'A';
    /** The value on the right-hand-side of the comparison (undefined if kind === 'D') */
    rhs: T;
    /** The value on the left-hand-side of the comparison (undefined if kind === 'N') */
    lhs: T;
    /** Indicates the array index where the change occurred */
    index?: number;
    /** Contains a nested change record indicating the change that occurred at the array index */
    item?: Diff;
    /** The property path (from the left-hand-side root) */
    path: ReadonlyArray<string> & { 0: number };
  }

  type Diff<T> = NewDiff<T> | EditDiff<T> | DeleteDiff<T> | ArrayDiff<T>;
  
  interface Accumulator<T> {
    push(o: T): void;
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
    origin?: { [id: string]: T } | Array<T>,
    /**
     * The right-hand operand; the object being compared structurally with the origin object.
     */
    target?: typeof origin,
    /**
     * An optional function that determines whether difference analysis should continue down the object graph
     */
    prefilter?: Prefilter,
    /**
     * An optional accumulator/array (requirement is that it have a push function).
     * Each difference is pushed to the specified accumulator.
     */
    acc?: Accumulator<Diff<T>>,
  ) => Diff<T>[] | undefined;

  export const diff: DiffFunction;
  export default Object.assign(diff, { diff });
}