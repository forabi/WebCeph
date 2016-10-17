declare const __DEBUG__: boolean;

declare type AngularUnit = 'degree' | 'radian';
type LinearUnit = 'mm' | 'cm' | 'in';
type LandmarkType = 'angle' | 'point' | 'line' | 'distance' | 'sum';

/**
 * A generic interface that represents any cephalometric landmark, including
 * angles, lines and points.
 * Landmarks may also have names and units.
 */
interface BaseCephaloLandmark {
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

interface CephaloPoint extends BaseCephaloLandmark {
  type: 'point',
}

 interface CephaloLine extends BaseCephaloLandmark {
  type: 'line',
  unit: LinearUnit,
  components: CephaloPoint[],
}

interface CephaloDistance extends BaseCephaloLandmark {
  type: 'distance';
  unit: LinearUnit;
  components: CephaloPoint[];
}

interface CephaloAngle extends BaseCephaloLandmark {
  type: 'angle';
  unit: AngularUnit;
  components: CephaloPoint[] | CephaloLine[] | CephaloAngle[];
}

interface CephaloAngularSum extends BaseCephaloLandmark {
  type: 'sum';
  unit: AngularUnit ;
  components: CephaloAngle[];
}

// interface CephaloLinearSum extends BaseCephaloLandmark {
//   type: 'sum';
//   unit: LinearUnit;
//   components: CephaloLine[];
// }

type CephaloSum = CephaloAngularSum; // CephaloLinearSum |;

type CephaloLandmark = CephaloPoint | CephaloLine | CephaloAngle | CephaloDistance | CephaloSum;

/**
 * Describes a geometrical point in a 2D-plane
 */
interface GeometricalPoint {
  x: number,
  y: number,
}

/**
 * Describes a geometrical line in a 2D-plane
 */
interface GeometricalVector {
  readonly x1: number,
  readonly x2: number,
  readonly y1: number,
  readonly y2: number,
}

/**
 * Describes an angle by its vectors
 */
interface GeometricalAngle {
  readonly vectors: ReadonlyArray<GeometricalVector>;
}

type GeometricalObject = GeometricalVector | GeometricalPoint | GeometricalAngle;

type EvaluatedValue = GeometricalObject | number;

type AnalysisComponent = {
  landmark: CephaloLandmark;
  norm: number;
  stdDev?: number;
};

interface AnalysisResult {
  type: number;
  severity: number;
  /** A list of symbol that were used to calculate this result */
  relevantComponents: string[];
}

interface BaseViewableAnalysisResult {
  name: string;
  indicates: string;
  severity: string;
}

interface ViewableAnalysisResultWithValue extends BaseViewableAnalysisResult {
  relevantComponents: {
    symbol: string;
    value: number;
    stdDev?: number;
    norm: number;
  }[];
}

type ViewableAnalysisResult = BaseViewableAnalysisResult | ViewableAnalysisResultWithValue

interface Analysis {
  id: string;
  components: AnalysisComponent[];

  /** Given a map of the evaluated values of this analysis components,
   * this function should return an array of interpreted results.
   * For example, given a computed value of 7 for angle ANB,
   * the returned value should have a result of type CLASS_II_SKELETAL_PATTERN
   */
  interpret(values: { [id: string]: EvaluatedValue }): AnalysisResult[];
}

/**
 * A Mapper object maps cephalometric landmarks to geometrical objects
 */
interface CephaloMapper {
  toVector(landmark: CephaloLine): GeometricalVector;
  toPoint(landmark: CephaloPoint): GeometricalPoint;
  toAngle(landmark: CephaloAngle): GeometricalAngle;
  /**
   * The scale factor is required to calculate linear measurements
   * It is expected to map pixels on the screen to millimeters.
   */
  scaleFactor: number;
}

type StepState = 'done' | 'current' | 'pending' | 'evaluating';
type Step = CephaloLandmark & { title: string, state: StepState };

type GenericState = { [id: string]: any };

declare namespace StoreEntries {
  namespace env {
    namespace compatibility {
      type isIgnored = boolean;
      type isBeingChecked = boolean;
      interface missingFeatures {
        [id: string]: MissingBrowserFeature;
      }
    }
  }

  namespace workspace {
    namespace canvas {
      interface manualLandmarks {
        [symbol: string]: GeometricalObject;
      }
      interface highlightedSteps {
        [symbol: string]: boolean;
      }
      type cursorStack = string[];
      type zoom = number;
      type zoomOffset = { x: number, y: number };
    }
  }
}

declare namespace Payloads {
  interface addManualLandmark {
    symbol: string;
    value: GeometricalObject;
  }
  type removeManualLandmark = string;
  type ignoreCompatiblity = void;
  type isCheckingCompatiblity = void;
  type missingFeatureDetected = MissingBrowserFeature;
  type highlightStepsOnCanvas = string[];
  type setCursor = string;
  type removeCursors = string[];
  type zoomIn = { zoom: number, x: number, y: number };
  type zoomOut = zoomIn;
}

type GenericAction = { type: string, payload: any };
type DispatchFunction = (GenericAction) => any;

interface EnhancedState<T> {
  past: T[];
  present: T,
  future: T[];
}

interface StoreState {
  'env.compatiblity.isIgnored': boolean;
  'env.compatiblity.missingFeatures': MissingBrowserFeature[];
  'env.compatiblity.isBeingChecked': boolean;
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
  'cephalo.workspace.analysis.stepsBeingEvaluated': { [symbol: string]: true; };
  'cephalo.workspace.analysis.isLoading': boolean;
  'cephalo.workspace.analysis.results.areShown': boolean;
}

/* Tools */
interface EditorTool {
  /**
   * Unique tool identifier
   */
  id: string;

  /**
   * Triggered when mouse enters the canvas.
   * Useful for setting the mouse cursor. */

  onCanvasMouseEnter?(): void;
  /**
   * Triggered when mouse leaves the canvas.
   * Useful for cleaning up any tool-specific cursors */
  onCanvasMouseLeave?(): void;

  /**
   * Triggered when the left mouse button is clicked.
   */
  onCanvasLeftClick?(x: number, y: number): void;

  /**
   * Triggered when the right mouse button is clicked.
   */
  onCanvasRightClick?(x: number, y: number): void;
  
  /**
   * Triggered when the mouse scrolls over the canvas.
   * Useful for implementing zoom functionality.
   */
  onCanvasMouseWheel?(x: number, y: number, delta: number, direction: number | string);

  /**
   * Triggered when the mouse enters a landmark.
   * Useful for adding a tool-specific cursor.
   */
  onLandmarkMouseEnter?(symbol: string): void;

  /**
   * Triggered when the mouse enters a landmark.
   * Useful for removing any tool-specific cursors.
   */
  onLandmarkMouseLeave?(symbol: string): void;

  /**
   * Triggered when a landmark is clicked.
   * Useful for manipulating previously added landmarks.
   */
  onLandmarkClick?(symbol: string, e: MouseEvent): void;
}

/** An EditorToolCreate is a function that is used to create editor tools.
 * It recieves the dispatch function as first argument and the state as the second arguemtn.
 */
type EditorToolCreator = (state: GenericState, dispatch: DispatchFunction) => EditorTool

/* Browser compatiblity checking */
type BrowserId = 'Chrome' | 'Firefox' | 'Opera' | 'Microsoft Edge' | 'Safari';
type OsId = 'mac' | 'windows' | 'linux' | 'chromeos' | 'ios' | 'android';

interface BrowserFeature {
  id: string;
  available: boolean;
  optional: boolean;
}

type MissingBrowserFeature = BrowserFeature & { available: false };

interface Browser {
  id: BrowserId | string;
  /** Display name for the browser */
  name: string;
  /**
   * The current version of the browser
   */
  version: string;
  /**
   * URL to the download page of the browser
   */
  downloadUrl: string;
}

interface BrowserRecommendation {
  id: BrowserId;
  /** Display name for the browser */
  name: string;
}
