import {
  WCephJSON,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import each from 'lodash/each';
import map from 'lodash/map';

import {
  loadImageFile,
} from 'actions/workspace';

import { validateIndexJSON } from './validate';

const importFile: WCeph.Importer = async (fileToImport, options) => {
  const {

  } = options;
  const actions: Action<any>[] = [];
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

  each(json.refs.images, async (path, id) => {
    const imageFile = await zip.file(path).async('blob');
    actions.push(loadImageFile(imageFile));
  });
  return actions;
};

export default importFile;
