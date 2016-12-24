import {
  WCephJSON,
  JSON_FILE_NAME,
} from './format';

import JSZip from 'jszip';

import map from 'lodash/map';
import keys from 'lodash/keys';

import {
  setImageProps,
  setWorkspaceMode,
  setActiveImageId,
  setSuperimpositionMode,
  superimposeImages,
} from 'actions/workspace';

import importImage from 'utils/importers/image/import';

import { validateIndexJSON } from './validate';

import uniqueId from 'lodash/uniqueId';

const importFile: Importer = async (fileToImport, options) => {
  const {
    loadWorkspaceSettings = true,
    loadSuperimpositionState = true,
  } = options;
  let actions: GenericAction[] = [];
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

  await Promise.all(map(
    json.refs.images,
    async (path: string) => {
      const id = uniqueId('imported_image_');
      const blob = await zip.file(path).async('blob');
      const name = json.data[id].name;
      const imageFile = new File([blob], name || id);
      actions = [
        ...actions,
        ...(await importImage(imageFile, { ids: [id] })),
        setImageProps({
          id,
          ...json.data[id],
        }),
      ];
    },
  ));

  if (loadSuperimpositionState) {
    let { mode, imageIds } = json.superimposition;
    if (mode === 'assisted') {
      mode = 'auto';
    }
    actions.push(setSuperimpositionMode({ mode }));
    actions.push(superimposeImages({ imageIds }));
  }

  if (loadWorkspaceSettings) {
    let { mode, activeImageId } = json.workspace;
    if (activeImageId === null) {
      activeImageId = keys(json.refs.images)[0];
    }
    actions.push(setActiveImageId({ imageId: activeImageId }));
    actions.push(setWorkspaceMode({ mode: mode || 'tracing' }));
  }

  return actions;
};

export default importFile;
