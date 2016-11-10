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

interface AnalysisInterpretation {
  indication: number;
  severity: number;
  /** A list of symbol that were used to calculate this result */
  relevantComponents: string[];
}

type CategorizedAnalysisResults = ReadonlyArray<{
  category: number;
  indication?: number;
  severity?: number;
  relevantComponents: ReadonlyArray<{
    symbol: string;
    value: number;
    norm?: number;
    stdDev?: number;
  }>;
}>

interface BaseViewableAnalysisResult {
  name: string;
  indicates: string;
  severity: string;
}

interface Analysis {
  id: string;
  components: AnalysisComponent[];

  /** Given a map of the evaluated values of this analysis components,
   * this function should return an array of interpreted results.
   * For example, given a computed value of 7 for angle ANB,
   * the returned value should have a result of type CLASS_II_SKELETAL_PATTERN
   */
  interpret(values: { [id: string]: EvaluatedValue }): AnalysisInterpretation[];
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
  scaleFactor: number | null;
  isBehind(point: GeometricalPoint, line: GeometricalVector): boolean;
}

type StepState = 'done' | 'current' | 'pending' | 'evaluating';
type Step = CephaloLandmark & { title: string, state: StepState };

type GenericState = { [id: string]: any };
type GenericError = { message: string, code?: number };
type WorkerType = 'image_worker' | 'tracing_worker';

type StageId = string;
type ImageId = string;

interface WorkerIntrinsicDetails {
  id: string;
  type: WorkerType;
}

type WorkerDetails = WorkerIntrinsicDetails & {
  isBusy: boolean;
  error: null | GenericError; 
};

type WorkerUpdate = {
  isBusy?: boolean;
  error?: null | GenericError;
}

type TracingMode = 'auto' | 'manual' | 'assisted';
type SuperimpostionMode = 'auto' | 'manual' | 'assisted';
type WorkspaceMode = 'tracing' | 'superimposition';
type ImageType = (
  'lateral_cephalo' |
  'frontal_cephalo' | 
  'lateral_photograph' |
  'frontal_photograph' |
  'panoramic' |
  null
);

type TreatmentStage = {
  id: StageId;
  displayName: string;
  imageIds: {
    [imagId: string]: true;
  };
}

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
    type mode = WorkspaceMode;

    namespace canvas {
      type width = number;
      type height = number;
      type top = number | null;
      type left = number | null;
      type mouseX = number | null;
      type mouseY = number | null;
      type highlightedStep = string | null; 
      type activeTool = string;
      /** 1 indicates the original image size */
      type scaleValue = number;
      /** A null value indicates that the scale origin is 50% 50% */
      type scaleOrigin = null | { x: number, y: number };
    }

    namespace superimposition {
      type mode = SuperimpostionMode;
      type imageIds = string[];
    }

    namespace treatmentStages {
      type order = string[];
      type data = {
        [stageId: string]: TreatmentStage;
      }
    }

    namespace analysis {
      type isLoading = boolean;
      type loadError = GenericError | null;
      type activeId = string | null;

      namespace results {
        type areShown = boolean;
      }
    }

    namespace images {
      type activeId = ImageId | null;
      type data = {
        [imageId: string]: {
          type: ImageType;
          data: string | null;
          width: number | null;
          height: number | null;
          isLoading: boolean;
          loadError: GenericError | null;
          flipX: boolean;
          flipY: boolean;
          contrast: number;
          brightness: number;
          invert: boolean;
          scaleFactor: number | null;
          suggestions: {
            flipX: boolean;
            flipY: boolean;
            type: ImageType;
          };
        };
      }
    }

    type tracing = {
      [imageId: string]: {
        manualLandmarks: {
          [symbol: string]: GeometricalObject;
        };
        skippedSteps: {
          [symbol: string]: true;
        };
      }
    }

    type workers = {
      [workerId: string]: WorkerDetails;
    } | { };
  }
}

declare namespace Payloads {
  type setWorkspaceMode = WorkspaceMode;
  type setActiveTracingStage = string;
  type addTreatmentStage = TreatmentStage;
  type removeTreatmentStage = string;
  interface addManualLandmark {
    imageId: string;
    symbol: string;
    value: GeometricalObject;
  }
  interface removeManualLandmark {
    imageId: string;
    symbol: string;
  };
  interface addUnnamedManualLandmark {
    imageId: string;
    value: GeometricalObject;
  }
  type undo = void;
  type redo = void;

  type setActiveImageId = ImageId;
  type flipImageX = { imageId: ImageId };
  type flipImageY = { imageId: ImageId };
  type invertColors = { imageId: ImageId };

  type setContrast = {
    imageId: ImageId;
    value: number;
  };
  type setBrightness = {
    imageId: ImageId;
    value: number;
  };
  type setInvert = {
    imageId: ImageId;
    value: number;
  };

  type resetWorkspace = void;
  type showAnalysisResults = void;
  type hideAnalysisResults = void;
  
  type ignoreCompatiblityCheck = void;
  type enforceCompatibilityCheck = void;
  type isCheckingCompatiblity = void;

  type setTracingMode = {
    stageId: string;
    mode: TracingMode;
  }

  type setScaleFactor = {
    stageId: string;
    value: number;
  };

  /** Stage ID */
  type unsetScaleFactor = string;

  type skipStep = string;
  type unskipStep = skipStep;

  type missingFeatureDetected = MissingBrowserFeature;

  type highlightStep = string;
  type unhighlightStep = void;

  type setCursor = string;
  type removeCursors = string[];
  type setScale = { scale: number, x?: number, y?: number };
  type setActiveTool = string;
  type disableActiveTool = setActiveTool;
  type enableTools = setActiveTool;
  type removeActiveTool = string;
  type updateCanvasSize = { top: number, left: number, width: number, height: number };
  type updateMousePosition = { x: number, y: number };

  type imageLoadSucceeded = {
    imageId: ImageId;
    data: string;
    height: number;
    width: number;
  };
  type imageLoadFailed = {
    imageId: ImageId;
    message: string;
  };
  type imageLoadRequested = {
    imageId: ImageId;
    file: File;
  }

  type analysisLoadFailed = GenericError;
  type analysisLoadRequested = string;
  type analysisLoadSucceeded = string;

  type addWorker = WorkerDetails;
  type removeWorker = string;
  type updateWorkerStatus = { id: string; } & WorkerUpdate;
}

type GenericAction = { type: string };
type Action<T> = GenericAction & { payload?: T };
type DispatchFunction = (action: GenericAction) => any;

interface UndoableState<T> {
  past: T[];
  present: T,
  future: T[];
}

type FinalState = GenericState;

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
/** An Editor Tool is just a collection of functions that consume state and dispatch actions.
 * The functions are collected to simplify the canvas logic and make it easier to switch the behavior of mouse actions on the canvas.
 */
interface EditorTool {
  /**
   * Triggered when mouse enters the canvas.
   */
  onCanvasMouseEnter?(): void;
  /**
   * Triggered when mouse leaves the canvas.
   */
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
  onCanvasMouseWheel?(x: number, y: number, delta: number);

  /**
   * Triggered when the mouse moves over the canvas.
   * Useful for implementing lens functionality.
   */
  onCanvasMouseMove?(x: number, y: number);

  /**
   * Triggered when the mouse enters a landmark.
   */
  onLandmarkMouseEnter?(symbol: string): void;

  /**
   * Triggered when the mouse enters a landmark.
   */
  onLandmarkMouseLeave?(symbol: string): void;

  /**
   * Triggered when a landmark is clicked.
   * Useful for manipulating previously added landmarks.
   */
  onLandmarkClick?(symbol: string, e: MouseEvent): void;

  /**
   * Called every time the mouse enters a landmark.
   * Useful for implementing tool-specific cursors.
   */
  getCursorForLandmark?(symbol: string): string | undefined;

  getCursorForCanvas?(): string | undefined;

  /** Indicates whether the lens should be shown when this tool is active.
   * `null` indicates no preference.
   */
  shouldShowLens: boolean | null;
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
  /**
   * The current version of the browser
   */
  version: string;
  /**
   * URL to the download page of the browser
   */
  downloadUrl: string;
}
