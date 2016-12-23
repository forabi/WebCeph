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

import {
  getWorkspaceImageIds,
} from 'store/reducers/workspace';

import {
  getImageProps,
  getActiveImageId,
  getTracingDataByImageId,
} from 'store/reducers/workspace/image';

import {
  getWorkspaceMode,
} from 'store/reducers/workspace/mode';

import {
  getTreatmentStagesOrder,
  getTreatmentStageDataById,
} from 'store/reducers/workspace/treatment';

import {
  getSuperimpsotionMode,
  getSuperimposedImages,
} from 'store/reducers/workspace/superimposition';

import { validateIndexJSON } from './validate';

const createExport: Exporter = async (state, options, onUpdate) => {
  const {
    imagesToSave = getWorkspaceImageIds(state),
    treatmentStagesToSave = getTreatmentStagesOrder(state),
    saveWorkspaceSettings = true,
  } = options;
  const zip = new JSZip();
  const imgFolder = zip.folder(IMAGES_FOLDER_NAME);

  const getProps = getImageProps(state);
  const getTracingData = getTracingDataByImageId(state);
  const getTreatmentData = getTreatmentStageDataById(state);

  await Promise.all(
    map(imagesToSave, async (imageId) => {
      const dataURI = getProps(imageId).data;
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
          (id) => `${IMAGES_FOLDER_NAME}/${id}`,
        ),
      ), // @FIXME @TODO
    },
    data: zipObject(
      imagesToSave,
      map(
        imagesToSave,
        (id) => ({
          ...getProps(id),
          tracing: {
            scaleFactor: getProps(id).scaleFactor,
            ...getTracingData(id),
          },
        }),
      ),
    ),
    superimposition: {
      mode: getSuperimpsotionMode(state),
      imageIds: getSuperimposedImages(state),
    },
    treatmentStages: {
      order: getTreatmentStagesOrder(state),
      data: zipObject(
        treatmentStagesToSave,
        map(
          treatmentStagesToSave,
          id => getTreatmentData(id),
        ),
      ),
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
            getActiveImageId(state) || undefined,
          ) || null
        : null
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
  const imageId = getActiveImageId(state)!;
  const imageName = getProps(imageId).name;
  const basename = imageName !== null ? getBaseName(imageName) : imageId;
  return new File([blob], `${basename}.wceph`);
};

export default createExport;
