import bluebird from 'bluebird';
import { readFileAsDataURL } from 'utils/file';

import {
  loadImageSucceeded,
} from 'actions/workspace';

const importFile: WCeph.Importer = async (fileToImport, _ = { }) => {
  const actions: Action<any>[] = [];
  const dataURL = await readFileAsDataURL(fileToImport);
  const img = new Image();
  img.src = dataURL;
  const { height, width } = await bluebird.fromCallback(cb => {
    img.onload = () => cb(null, img);
    img.onerror = ({ error }) => cb(error, null);
  });
  actions.push(loadImageSucceeded({
    name: fileToImport.name,
    data: dataURL,
    height,
    width,
  }));
  return actions;
};

export default importFile;
