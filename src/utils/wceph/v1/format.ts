type WCephFile_v1 = {
  /** Mandatory version specifier, always 1. */
  v: 1;

  /**
   * A map of object IDs to the paths of files inside the ZIP
   */
  refs: {
    /** Thumbnails */
    thumbs: {
      '64x64'?: string;
      '128x128'?: string;
      '256x256'?: string;
      '512x512'?: string;
    }
    /** Actual images */
    images: {
      [imageId: string]: string;
    };
  };

  /** Data indexed by image ID */
  data: {
    [imageId: string]: {
      type: (
        'lateral_cephalo' | 'frontal_cephalo' |
        'lateral_photograph' | 'frontal_photograph' |
        'panoramic' | null
      );
      flipX: boolean;
      flipY: boolean;
      invert: boolean;
      brightness: number;
      contrast: number;
      tracing: {
        tracingMode: 'auto' | 'assisted' | 'manual';
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
        activeId: string;
      }
    }
  }

  workspace: {
    mode: 'tracing' | 'superimposition';
    activeImageId: string | null;
  }

  superimposition: {
    mode: 'auto' | 'manual' | 'assisted';
    /** An order list of superimposed images. */
    imageIds: string[];
  };

  treatmentStages: {
    /** User-specified order of treatment stages */
    order: string[];
    data: {
      [stageId: string]: {
        /** An ordered list of images assigned to this treatment stage */
        imageIds: string[];
      };
    }
  };
}