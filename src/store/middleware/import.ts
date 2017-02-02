import { Store, Middleware } from 'redux';

import find from 'lodash/find';
import each from 'lodash/each';

import {
  importFileRequested,
  importFileSucceeded,
  importFileFailed,
} from 'actions/workspace';

import { isActionOfType } from 'utils/store';

import importWCeph from 'utils/importers/wceph/v1/import';
import importImage from 'utils/importers/image/import';

const importers = [
  {
    doesMatch: (file: File) => {
      return Boolean(file.name.match(/\.wceph$/i));
    },
    importFn: importWCeph,
  },
  {
    doesMatch: (_: File) => {
      return true;
    },
    importFn: importImage,
  },
];

const fail = (error: Error, workspaceId: string) => {
  console.error(
    `Failed to import file.`,
    error,
  );
  return importFileFailed({ workspaceId, error });
};

const middleware: Middleware = ({ dispatch }: Store<StoreState>) =>
  (next: GenericDispatch) => async (action: GenericAction) => {
    if (isActionOfType(action, 'LOAD_IMAGE_FROM_URL_REQUESTED')) {
      next(action);
      const { url, workspaceId } = action.payload;
      try {
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], 'demo_image');
        return dispatch(importFileRequested({ file, workspaceId }));
      } catch (error) {
        return dispatch(fail(error, workspaceId));
      }
    } else if (isActionOfType(action, 'IMPORT_FILE_REQUESTED')) {
      next(action);
      const { file, workspaceId } = action.payload;
      console.info('Importing file...', file.name);
      const importer = find(importers, ({ doesMatch }) => doesMatch(file));
      if (importer) {
        try {
          const actions = [
            ...(await importer.importFn(file, { workspaceId })),
            importFileSucceeded({ workspaceId }),
          ];
          each(actions, dispatch);
        } catch (error) {
          return dispatch(fail(error, workspaceId));
        }
      } else {
        console.warn(
          `Type of ${file.name} is not a supported format.`,
        );
        throw new Error('Incompatible file type');
      }
    } else {
      return next(action);
    }
  };

export default middleware;
