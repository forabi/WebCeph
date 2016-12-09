declare const __DEBUG__: boolean;
declare const __VERSION__: string;

type AngularUnit = 'degree' | 'radian';
type LinearUnit = 'mm' | 'cm' | 'in';
type LandmarkType = 'angle' | 'point' | 'line' | 'distance' | 'sum';

/**
 * A generic interface that represents any cephalometric landmark, including
 * angles, lines and points.
 * Landmarks may also have names and units.
 */
interface CephaloLandmark {
  name?: string;
  /**
   * Each landmark must have a symbol which acts as the unique identifier for that landmark.
   */
  symbol: string;
  description?: string;
  type: LandmarkType;
  unit?: AngularUnit | LinearUnit;
  /**
   * Some landmarks are composed of more basic components; for example, a line is
   * composed of two points.
   */
  components: CephaloLandmark[];
  /**
   * An optional custom calculation method.
   * It is passed the computed values for each of this landmark's components
   * in the same order they were defined.
   */
  calculate?(mapper: CephaloMapper, ...args: EvaluatedValue[]): number;

  /** An optional custom mapping method.
   * It is passed the geometrical representation of this landmark's components
   * in the same order they were defined.
   */
  map?(mapper: CephaloMapper, ...args: (GeometricalObject | undefined)[]): GeometricalObject;
}

interface CephaloPoint extends CephaloLandmark {
  type: 'point';
}

 interface CephaloLine extends CephaloLandmark {
  type: 'line';
  unit: LinearUnit;
  components: CephaloPoint[];
}

interface CephaloDistance extends CephaloLandmark {
  type: 'distance';
  unit: LinearUnit;
  components: CephaloPoint[];
}

interface CephaloAngle extends CephaloLandmark {
  type: 'angle';
  unit: AngularUnit;
  components: CephaloPoint[] | CephaloLine[] | CephaloAngle[];
}

interface CephaloAngularSum extends CephaloLandmark {
  type: 'sum';
  unit: AngularUnit ;
  components: CephaloAngle[];
}

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
  readonly vectors: [GeometricalVector, GeometricalVector];
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
}>;

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

type GenericError = { message: string, code?: number };

type WorkerDetails = {
  id: string;
  type: 'image_worker' | 'tracing_worker';
  isBusy: boolean;
  error: null | GenericError; 
};

type TracingMode = 'auto' | 'manual' | 'assisted';

type ExportFileFormat = 'wceph_v1' | 'jpeg';
type ExportFileOptions = any; // @TODO

interface UndoableState<T> {
  past: T[];
  present: T,
  future: T[];
}

type ImageType = (
  'ceph_lateral' | 'ceph_pa' |
  'photo_lateral' | 'photo_frontal' |
  'panoramic'
);

interface StoreState {
  'env.connection.isOffline': boolean;
  'app.init.isInitialized': boolean;
  'app.status.isUpdating': boolean;
  'app.status.isCaching': boolean;
  'app.status.isCached': boolean;
  'app.persistence.isSupported': boolean;
  'app.persistence.isSaving': boolean;
  'app.persistence.isLoading': boolean;
  'app.persistence.isUpgrading': boolean;
  'app.persistence.save.error': GenericError | null;
  'app.persistence.load.error': GenericError | null;
  'env.compat.isIgnored': boolean;
  'env.compat.isBeingChecked': boolean;
  'env.compat.results': {
    [userAgent: string]: {
      missingFeatures: {
        [featureId: string]: MissingBrowserFeature;
      };
    };
  };
  'workspace.export.isExporting': boolean;
  'workspace.export.error': GenericError | null;
  'workspace.import.isImporting': boolean;
  'workspace.import.error': boolean;
  'workspace.mode': 'tracing' | 'superimposition';
  'workspace.canvas.dimensions': {
    width: number;
    height: number;
  };
  'workspace.canvas.mouse.position': null | {
    x: number;
    y: number;
  };
  'workspace.canvas.tools.activeToolId': string;
  'workspace.canvas.scale.value': number;
  'workspace.canvas.scale.offset': {
    top: number;
    left: number;
  };
  /** Data indexed by image ID */
  'workspace.images': {
    [imageId: string]: {
      name: string | null;
      data: string;
      /** A null value indicates that the image type is not set or is unknown */
      type: ImageType | null;
      width: number;
      height: number;
      scaleFactor: number | null;
      flipX: boolean;
      flipY: boolean;
      /** A value between 0 and 1, defaults to 0.5 */
      brightness: number;
      /** A value between 0 and 1, defaults to 0.5 */
      contrast: number;
      /** Wether the image colors should be inverted */
      invertColors: boolean;
      tracing: {
        mode: 'auto' | 'assisted' | 'manual';
        scaleFactor: number | null;
        manualLandmarks: {
          [symbol: string]: GeometricalObject;
        };
        /** Steps to skip in non-manual tracing modes */
        skippedSteps: {
          [symbol: string]: true;
        };
      };
      analysis: {
        /** Last used analysis for this image */
        activeId: string | null;
      };
    };
  };
  'workspace.images.activeImageId': string | null;
  'workspace.superimposition': {
    mode: 'auto' | 'manual' | 'assisted';
    /** An order list of superimposed images. */
    imageIds: string[];
  };
  'workspace.treatment.stages': {
    /** User-specified order of treatment stages */
    order: string[];
    data: {
      [stageId: string]: {
        /** An ordered list of images assigned to this treatment stage */
        imageIds: string[];
      };
    }
  };
  'workspace.workers': {
    [workerId: string]: WorkerDetails;
  };
  'workspace.analysis.lastUsedId': {
    activeId: string | null;
  };
};

type ToolId = (
  'ADD_POINT' |
  'REMOVE_LANDMARK' |
  'ZOOM_WITH_CURSOR'
);

interface Events {
  CONNECTION_STATUS_CHANGED: Partial<{
    isOffline: boolean;
    isSlow: boolean;
    isMetered: boolean;
  }>;
  APP_CACHING_STATUS_CHANGED: Partial<{
    /**
     * A null value indicates unknown progress,
     * undefined indicates no change in value
     * */
    progress: number | null;
    complete: boolean;
    error: GenericError;
  }>;
  WORKER_CREATED: WorkerDetails;
  WORKER_TERMINATED: string;
  WORKER_STATUS_CHANGED: Pick<WorkerDetails, 'isBusy' | 'error'>;
  APP_IS_READY: void;
  LOAD_IMAGE_FROM_URL_REQUESTED: {
    url: string;
  };
  EXPORT_FILE_REQUESTED: {
    format: ExportFileFormat;
    options?: ExportFileOptions;
  };
  EXPORT_FILE_SUCEEDED: void,
  EXPORT_FILE_FAILED: GenericError,
  EXPORT_PROGRESS_CHANGED: {
    value: number;
    data?: any; // @TODO;
  };
  IMPORT_FILE_REQUESTED: File;
  IMPORT_FILE_SUCCEEDED: void;
  IMPORT_FILE_FAILED: GenericError;
  IMPORT_PROGRESS_CHANGED: {
    value: number;
    data?: any; // @TODO;
  },
  LOAD_IMAGE_REQUESTED: {
    id: string;
    file: File;
  };
  LOAD_IMAGE_SUCCEEDED: {
    id: string;
    name: string;
    height: number;
    width: number;
  };
  LOAD_IMAGE_FAILED: GenericError;
  CANVAS_RESIZED: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  ADD_MANUAL_LANDMARK_REQUESTED: {
    imageId: string;
    symbol: string;
    value: GeometricalObject;
  };
  ADD_UNKOWN_MANUAL_LANDMARK_REQUESTED: {
    imageId: string;
    value: GeometricalObject;
  }
  REMOVE_MANUAL_LANDMARK_REQUESTED: {
    imageId: string;
    symbol: string;
  };
  FLIP_IMAGE_X_REQUESTED: {
    imageId: string;
  };
  FLIP_IMAGE_Y_REQUESTED: {
    imageId: string;
  };
  SET_IMAGE_BRIGHTNESS_REQUESTED: {
    imageId: string;
    /** A value between 0 and 1 */
    value: number;
  };
  SET_IMAGE_CONTRAST_REQUESTED: {
    imageId: string;
    /** A value between 0 and 1 */
    value: number;
  };
  INVERT_IMAGE_REQUESTED: {
    imageId: string;
  },
  RESET_WORKSPACE_REQUESTED: void;
  IGNORE_WORKSPACE_ERROR_REQUESTED: void;
  MOUSE_POSITION_CHANGED: {
    x: number;
    y: number;
  };
  REDO_REQUESTED: void;
  UNDO_REQUESTED: void;
  SET_SCALE_REQUESTED: {
    imageId: string;
    scale: number;
  };
  HIGHLIGHT_STEP_ON_CANVAS_REQUESTED: {
    symbol: string;
  };
  UNHIGHLIGHT_STEP_ON_CANVAS_REQUESTED: void;
  SET_ACTIVE_TOOL_REQUESTED: ToolId;
  SET_ANALYSIS_REQUESTED: string,
  SET_ANALYSIS_SUCCEEDED: void,
  SET_ANALYSIS_FAILED: GenericError & {
    analysisId: string
  };
  SET_TRACING_MODE_REQUESTED: {
    imageId: string;
    mode: TracingMode;
  };
  SKIP_MANUAL_STEP_REQUESTED: {
    imageId: string;
    step: string;
  };
  UNSKIP_MANUAL_STEP_REQUESTED: {
    imageId: string;
    step: string;
  };
  SET_SCALE_FACTOR_REQUESTED: {
    imageId: string;
    value: number;
  };
  UNSET_SCALE_FACTOR_REQUESTED: {
    imageId: string;
  };
  TOGGLE_ANALYSIS_RESULTS_REQUESTED: void;
  BROWSER_COMPATIBLITY_CHECK_REQUESTED: void;
  BROWSER_COMPATIBLITY_CHECK_SUCCEEDED: void;
  BROWSER_COMPATIBLITY_CHECK_FAILED: GenericError;
  IGNORE_BROWSER_COMPATIBLITY_REQUESTED: void;
  ENFORCE_BROWSER_COMPATIBLITY_REQUESTED: void;
  MISSING_BROWSER_FEATURE_DETECTED: {
    userAgent: string;
    feature: MissingBrowserFeature;
  };
  LOAD_PERSISTED_STATE_REQUESTED: void;
  LOAD_PERSISTED_STATE_SUCCEEDED: void;
  LOAD_PERSISTED_STATE_FAILED: GenericError;
  PERSIST_STATE_STARTED: void,
  PERSIST_STATE_SUCCEEDED: void,
  PERSIST_STATE_FAILED: GenericError,
  CLEAR_PRESISTED_STATE_REQUESTED: void,
  CLEAR_PRESISTED_STATE_SUCCEEDED: void,
  CLEAR_PERSISTED_STATE_FAILED: GenericError,
};

type GenericDispatch = (action: GenericAction) => any;

type ActionType = keyof Events;
type StoreEntry = keyof StoreState;

type GenericAction = {
  type: ActionType;
  payload?: any;
};

type Action<K extends ActionType> = {
  type: K;
  payload: Events[K];
};

type Reducer<S extends StoreEntry, A extends ActionType> = (state: StoreState[S], action: Action<A>) => StoreState[S];

type ReducerMap = {
  [S in keyof StoreState]: Reducer<S, ActionType>;
};

type ActionToReducerMap<S extends StoreEntry> = Partial<{
  [A in ActionType]: Reducer<S, A>;
}>;

/* Tools */
/** An Editor Tool is just a collection of functions that consume state and dispatch actions.
 * The functions are collected to simplify the canvas logic and make it easier to switch the behavior of mouse actions on the canvas.
 */
interface EditorTool {
  /**
   * Triggered when mouse enters the canvas.
   */
  onCanvasMouseEnter?(dispatch: GenericDispatch): void;
  /**
   * Triggered when mouse leaves the canvas.
   */
  onCanvasMouseLeave?(dispatch: GenericDispatch): void;

  /**
   * Triggered when the left mouse button is clicked.
   */
  onCanvasLeftClick?(dispatch: GenericDispatch, x: number, y: number): void;

  /**
   * Triggered when the right mouse button is clicked.
   */
  onCanvasRightClick?(dispatch: GenericDispatch, x: number, y: number): void;
  
  /**
   * Triggered when the mouse scrolls over the canvas.
   * Useful for implementing zoom functionality.
   */
  onCanvasMouseWheel?(dispatch: GenericDispatch, x: number, y: number, delta: number);

  /**
   * Triggered when the mouse moves over the canvas.
   * Useful for implementing lens functionality.
   */
  onCanvasMouseMove?(dispatch: GenericDispatch, x: number, y: number);

  /**
   * Triggered when the mouse enters a landmark.
   */
  onLandmarkMouseEnter?(dispatch: GenericDispatch, symbol: string): void;

  /**
   * Triggered when the mouse enters a landmark.
   */
  onLandmarkMouseLeave?(dispatch: GenericDispatch, symbol: string): void;

  /**
   * Triggered when a landmark is clicked.
   * Useful for manipulating previously added landmarks.
   */
  onLandmarkClick?(dispatch: GenericDispatch, symbol: string, e: MouseEvent): void;

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

  getPropsForLandmark?(symbol: string): { [id: string]: any } | undefined;
}

/** An EditorToolCreator is a function that is used to create editor tools.
 * It recieves the store state as the first argument.
 */
type EditorToolCreator = (state: StoreState) => EditorTool;

type ValidationError = GenericError & {
  type: number;
  data?: any;
};

type ExportProgressCallback = (
  value: number,
  data?: any, // @TODO
) => void;

namespace WCeph {
  type ImportOptions = {
    imagesToLoad?: string[];
    loadTracingData?: boolean;
    loadWorkspaceSettings?: boolean;
    loadSuperimpositionState?: boolean;
    treatmentStagesToLoad?: string[];
  }

  /**
   * A WCeph File importer recieves the file to be imported along with any import options and
   * returns an array of actions to be dispatched in order.
   */
  type Importer = (file: File, options: ImportOptions) => Promise<Action<any>[]>;


  type ExportOptions = {
    imagesToSave?: string[];
    saveTracingData?: boolean;
    saveWorkspaceSettings?: boolean;
    saveSuperimpositionState?: boolean;
    treatmentStagesToSave?: string[];
    thumbs?: {
      '64x64'?: boolean;
      '128x128'?: boolean;
      '256x256'?: boolean;
      '512x512'?: boolean;
    };
  }

  type ValidateOptions = {

  };

  /**
   * A WCeph File exporter recieves the application state along with any export options and
   * returns an File blob to be saved.
   */
  type Exporter = (
    state: StoreState,
    options: ExportOptions,
    progressCallback?: ExportProgressCallback,
  ) => Promise<File>;

  /**
   * A WCeph validator recieves the file to validate and returns zero, one or more validation errors.
   * A return value with length = 0 means that the files is valid.
   */
  type Validator = (
    fileToValidate: File,
    options: ValidateOptions,
  ) => Promise<ValidationError[]>;
}

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
