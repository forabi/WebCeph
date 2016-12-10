import {
  WCephJSON,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import each from 'lodash/each';
import map from 'lodash/map';

import {
  importFileRequested,
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

  const errors = validateIndexJSON(json);
  if (errors.length > 0) {
    if (__DEBUG__) {
      console.warn(
        '[BUG] Failed to import file. ' +
        'Trying to import an invalid WCeph format. ' + (
          json.debug ? (
            'Looks like the file has been exported ' +
            'while in development.'
          ) : (
            'This might be a bug in validation or import. '
          )
        ),
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

  const loadImages = await Promise.all(map(
    json.refs.images,
    async (path: string, id: string) => {
      const blob = await zip.file(path).async('blob');
      const name = json.data[id].name;
      const imageFile = new File([blob], name || id);
      return importFileRequested(imageFile);
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
