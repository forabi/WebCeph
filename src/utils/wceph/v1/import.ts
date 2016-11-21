import {
  WCephJSON,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import each from 'lodash/each';
import map from 'lodash/map';

import {
  loadImageFile,
  flipX as flipImageX,
  flipY as flipImageY,
  setBrightness,
  setContrast,
  invertColors as invertImageColors,
  setAnalysis,
  addManualLandmark,
} from 'actions/workspace';

import { validateIndexJSON } from './validate';

const importFile: WCeph.Importer = async (fileToImport, options) => {
  const {

  } = options;
  let actions: Action<any>[] = [];
  const zip = new JSZip();
  await zip.loadAsync(fileToImport);
  const json: WCephJSON = JSON.parse(
    await zip.file(JSON_FILE_NAME).async('string')
  );

  if (__DEBUG__) {
    const errors = validateIndexJSON(json);
    if (errors.length > 0) {
      console.warn(
        `Trying to import an invalid WCeph file`,
        map(errors, e => e.message),
      );
    }
  }

  const loadImages = await Promise.all(map(
    json.refs.images,
    async (path: string, id: string) => {
      const blob = await zip.file(path).async('blob');
      // const type = json.data[id].fileType; // @TODO
      const imageFile = new File([blob], id, { type: 'image/bmp' });
      return loadImageFile(imageFile);
    }
  ));

  actions = [
    ...actions,
    ...loadImages,
  ];

  each(json.data, (image, _) => {
    const {
      flipX, flipY,
      brightness, contrast,
      invertColors, tracing: { manualLandmarks },
      analysis: { activeId: analysisId },
    } = image;
    if (flipX) {
      actions.push(flipImageX());
    }
    if (flipY) {
      actions.push(flipImageY());
    }
    actions.push(setBrightness(brightness * 100));
    actions.push(setContrast(contrast));
    if (invertColors) {
      actions.push(invertImageColors());
    }
    each(manualLandmarks, (value: GeometricalObject, symbol: string) => {
      actions.push(addManualLandmark(symbol, value));
    });
    if (analysisId !== null) {
      actions.push(setAnalysis(analysisId));
    }
  });
  return actions;
};

export default importFile;
