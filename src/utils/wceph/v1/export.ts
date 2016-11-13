import {
  WCephJSON,
  IMAGES_FOLDER_NAME,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import each from 'lodash/each';
import find from 'lodash/find';
import zipObject from 'lodash/zipObject';
import map from 'lodash/map';

const createExport: WCeph.Exporter = async (state, options) => {
  const {
    imagesToSave = getImageIds(state),
    saveWorkspaceSettings = true,
  } = options;
  const zip = new JSZip();
  const imgFolder = zip.folder(IMAGES_FOLDER_NAME);
  const getData = getImageDataById(state);
  const getType = getImageTypeById(state);
  const getBrightness = getImageBrightnessById(state);
  const getContrast = getImageContrastById(state);
  const isFlippedX = isImageFlippedX(state);
  const isFlippedY = isImageFlippedY(state);
  const isInverted = isImageFlippedY(state);
  const getScaleFactor = getScaleFactorById(state);
  const getTracingMode = getTracingModeById(state);
  const getManualLandmarks = getSManualLandmarksById(state);
  const getSkippedSteps = getSkippedStepsById(state);
  const getActiveAnalysisId = getActiveAnalysisById(state);

  // @TODO: use selectors to get data;
  each(imagesToSave, (imageId) => {
    const blob = getData(imageId);
    imgFolder.file(imageId, blob);
  });

  const json: WCephJSON = {
    version: 1,
    refs: {
      thumbs: {

      },
      images: zipObject(
        imagesToSave,
        map(
          imagesToSave,
          (id) => `${IMAGES_FOLDER_NAME}/${id}`
        ),
      ),
    },
    data: zipObject(
      imagesToSave,
      map(
        imagesToSave,
        (id) => ({
          type: getType(id),
          flipX: isFlippedX(id),
          flipY: isFlippedY(id),
          invertColors: isInverted(id),
          contrast: getContrast(id),
          brightness: getBrightness(id),
          tracing: {
            mode: getTracingMode(id),
            scaleFactor: getScaleFactor(id),
            manualLandmarks: getManualLandmarks(id),
            skippedSteps: getSkippedSteps(id),
          },
          analysis: {
            activeId: getActiveAnalysisId(id),
          },
        })
      ),
    ),
    superimposition: {
      mode: 'assisted',
      imageIds: [],
    },
    treatmentStages: {
      order: [],
      data: {

      },
    },
    workspace: {
      mode: (
        saveWorkspaceSettings ?
          getWorkspaceMode(state) : undefined
      ),
      activeImageId: (
        saveWorkspaceSettings ?
          find(
            imagesToSave,
            getActiveImageId(state)
          ) || null
        : undefined
      ),
    },
  };
  zip.file(JSON_FILE_NAME, JSON.stringify(json));
  return zip.generateAsync({ type : 'blob' }) as Promise<Blob>;
};

export default createExport;
