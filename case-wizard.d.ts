declare type AngularUnit = 'degree' | 'radian';
declare type LinearUnit = 'mm' | 'cm' | 'in';
declare type LandmarkType = 'angle' | 'point' | 'line'; 

/**
 * A generic interface that represents any cephalometric landmark, including
 * angles, lines and points.
 * Landmarks may also have names and units.
 */
declare interface CephaloLandmark {
  name?: string,
  /**
   * Each landmark must have a symbol which acts as the unique identifier for that landmark.
   */
  symbol: string,
  description?: string,
  type: LandmarkType,
  unit?: AngularUnit | LinearUnit,
  /**
   * Some landmarks are composed of more basic components; for example, a line is
   * composed of two points.
   */
  components: CephaloLandmark[],
  /**
   * An optional custom calculation method.
   * It is passed the computed values for each of this landmark's components
   * in the same order they were declared.
   */
  calculate?(...args: number[]): number,
}

declare interface MappedCephaloLandmark extends CephaloLandmark {
  mappedTo?: (GeometricalLine | GeometricalPoint);
  visible: boolean;
}

declare interface CephaloPoint extends CephaloLandmark {
  type: 'point',
}

declare interface CephaloLine extends CephaloLandmark {
  type: 'line',
  unit: LinearUnit,
  components: CephaloPoint[],
}

declare interface CephaloAngle extends CephaloLandmark {
    type: 'angle';
    unit: AngularUnit;
    components: CephaloLine[]
}

/**
 * Describes a geometrical point in a 2D-plane
 */
declare interface GeometricalPoint {
  x: number,
  y: number,
};

/**
 * Describes a geometrical line in a 2D-plane
 */
declare interface GeometricalLine {
  x1: number,
  x2: number,
  y1: number,
  y2: number,
}

declare type Analysis = Array<{ landmark: CephaloLandmark, norm: number, stdDev?: number }>;

/**
 * A Mapper object maps cephalometric landmarks to geometrical objects
 */
declare interface CephaloMapper {
  toLine(landmark: CephaloLine): GeometricalLine;
  toPoint(landmark: CephaloPoint): GeometricalPoint;
  /**
   * The scale factor is required to calculate linear measurements
   * It is expected to map pixels on the screen to millimeters.
   */
  scaleFactor: number;
}


declare type stepState = 'done' | 'current' | 'pending' | 'evaluating';
declare type Step = CephaloLandmark & { title: string, state: stepState };

declare interface StoreState {
  'cephalo.workspace.image.data': string | null;
  'cephalo.workspace.error': { message: string } | null;
  'cephalo.workspace.canvas.height': number;
  'cephalo.workspace.canvas.width': number;
  'cephalo.workspace.image.isLoading': boolean;
  'cephalo.workspace.image.isCephalo': boolean;
  'cephalo.workspace.image.isFrontal': boolean;
  'cephalo.workspace.workers': {
    [id: string]: {
      isBusy: boolean,
      error?: { message: string },
    },
  };
  'cephalo.workspace.image.shouldFlipX': boolean;
  'cephalo.workspace.image.shouldFlipY': boolean;
  'cephalo.workspace.image.flipX': boolean;
  'cephalo.workspace.image.flipY': boolean;
  'cephalo.workspace.image.brightness': number;
  'cephalo.workspace.image.invert': boolean;
  'cephalo.workspace.image.contrast': number;
  'cephalo.workspace.analysis.activeAnalysis': Analysis | null;
  'cephalo.workspace.analysis.stepsBeingEvaluated': string[];
  'cephalo.workspace.analysis.isLoading': boolean;
  'cephalo.workspace.landmarks': {
    [id: string]: CephaloLandmark & {
      visible: boolean;
      mappedTo?: GeometricalPoint | GeometricalLine
    };
  };
}