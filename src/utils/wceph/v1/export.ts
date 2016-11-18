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

const getImageIds = (_: any) => ['image_1'];

import {
  getActiveAnalysisId,
  getManualLandmarks,
} from 'store/reducers/workspace/analysis';

import {
  getImageData,
  getImageBrightness,
  getImageContrast,
  isImageInverted,
  isImageFlippedY,
  isImageFlippedX,
} from 'store/reducers/workspace/image';

const createExport: WCeph.Exporter = async (state, options, onUpdate) => {
  const {
    imagesToSave = getImageIds(state),
    saveWorkspaceSettings = true,
  } = options;
  const zip = new JSZip();
  const imgFolder = zip.folder(IMAGES_FOLDER_NAME);

  /** Mock functions
   * @TODO: replace with real selectors when superimposition branch is merged
   */
  const getData = (_: string) => getImageData(state);
  const getType = (_: string) => null;
  const getBrightness = (_: string) => getImageBrightness(state);
  const getContrast = (_: string) => getImageContrast(state);
  const isFlippedX = (_: string) => isImageFlippedX(state);
  const isFlippedY = (_: string) => isImageFlippedY(state);
  const isInverted = (_: string) => isImageInverted(state);
  const getScaleFactor = (_: any) => null;
  const getTracingMode = (_: any) => 'assisted';
  const getManualLandmarksByImageId = (_: string) => getManualLandmarks(state).present;
  const getSkippedSteps = (_: string) => ({ });
  const getWorkspaceMode = (_: any) => 'tracing';
  const getActiveImageId = (_: any) => imagesToSave[0];
  const getAnalysisIdForImage = (_: string) => getActiveAnalysisId(state);

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
            manualLandmarks: getManualLandmarksByImageId(id),
            skippedSteps: getSkippedSteps(id),
          },
          analysis: {
            activeId: getAnalysisIdForImage(id),
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
  zip.file(JSON_FILE_NAME, JSON.stringify(json, undefined, 2));
  return zip.generateAsync(
    {
      type : 'blob',
      compression: 'DEFLATE',
      mimeType: 'application/wceph',
    },
    onUpdate !== undefined ? ({ percent }: { percent: number }) => {
      onUpdate(percent);
    } : undefined,
  ) as Promise<Blob>;
};

export default createExport;
