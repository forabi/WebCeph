import bluebird from 'bluebird';
import { readFileAsDataURL } from 'utils/file';

import {
  loadImageSucceeded,
} from 'actions/workspace';

import uniqueId from 'lodash/uniqueId';

const importFile: Importer = async (fileToImport, options) => {
  const {
    ids = [uniqueId('imported_image_')],
  } = options;
  const actions: GenericAction[] = [];
  const dataURL = await readFileAsDataURL(fileToImport);
  const img = new Image();
  img.src = dataURL;
  const { height, width } = await bluebird.fromCallback(cb => {
    img.onload = () => cb(null, img);
    img.onerror = ({ error }) => cb(error, null);
  });
  actions.push(loadImageSucceeded({
    id: ids[0],
    name: fileToImport.name,
    data: dataURL,
    height,
    width,
  }));
  return actions;
};

export default importFile;
