import {
  WCephJSON,
  IMAGES_FOLDER_NAME,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import { getBaseName } from 'utils/file';

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
  getImageName,
  getImageBrightness,
  getImageContrast,
  isImageInverted,
  isImageFlippedY,
  isImageFlippedX,
} from 'store/reducers/workspace/image';

import { validateIndexJSON } from './validate';

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
  const getName = (_: string) => getImageName(state);
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
  await Promise.all(
    map(imagesToSave, async (imageId) => {
      const dataURI = getData(imageId);
      if (dataURI !== null) {
        const response = await fetch(dataURI);
        const blob = await response.blob();
        imgFolder.file(imageId, blob);
      } else {
        console.warn(
          `[BUG] Trying to export a file without image data`
        );
      }
    }),
  );

  const json: WCephJSON = {
    version: 1,
    debug: __DEBUG__ || undefined,
    refs: {
      thumbs: {

      },
      images: zipObject(
        imagesToSave,
        map(
          imagesToSave,
          (id) => `${IMAGES_FOLDER_NAME}/${id}`
        ),
      ), // @FIXME @TODO
    },
    data: zipObject(
      imagesToSave,
      map(
        imagesToSave,
        (id) => ({
          name: getName(id),
          type: getType(id),
          flipX: isFlippedX(id),
          flipY: isFlippedY(id),
          invertColors: isInverted(id),
          contrast: getContrast(id),
          brightness: getBrightness(id) / 100, // @FIXME
          tracing: {
            mode: getTracingMode(id),
            scaleFactor: getScaleFactor(id),
            manualLandmarks: getManualLandmarksByImageId(id),
            skippedSteps: getSkippedSteps(id),
          },
          analysis: {
            activeId: getAnalysisIdForImage(id),
          },
        }), // @FIXME @TODO
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

  const errors = validateIndexJSON(json);
  if (errors.length > 0) {
    if (__DEBUG__) {
      console.warn(
        '[BUG] Failed to export file. ' +
        'Trying to export file as an invalid WCeph format. ' +
        'This is a bug either in validation or in export logic.',
        map(errors, e => e.message),
      );
    }
    throw new TypeError(
      `Could not export file. ` + (
        (errors.length === 1) ? errors[0].message : (
          `The following errors were encoutered while exporting: \n` +
            map(errors, e => e.message).join('\n')
        )
      ),
    );
  }

  zip.file(JSON_FILE_NAME, JSON.stringify(json, undefined, 2));
  const blob: Blob = await zip.generateAsync(
    {
      type : 'blob',
      compression: 'DEFLATE',
      mimeType: 'application/wceph',
    },
    onUpdate !== undefined ? ({ percent }: { percent: number }) => {
      onUpdate(percent);
    } : undefined,
  );
  // @TODO: better naming
  const imageName = getName(imagesToSave[0]);
  const imageId = imagesToSave[0];
  const basename = imageName !== null ? getBaseName(imageName) : imageId;
  return new File([blob], `${basename}.wceph`);
};

export default createExport;
