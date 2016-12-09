import { Event } from 'utils/constants';
import { Store, Middleware } from 'redux';

import find from 'lodash/find';
import each from 'lodash/each';

import {
  importFileRequested,
  importFileSucceeded,
  importFileFailed,
} from 'actions/workspace';

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

const middleware: Middleware = ({ dispatch }: Store<any>) =>
  (next: GenericDispatch) => async (action: Action<any>) => {
    const { type } = action;
    try {
      if (type === Event.LOAD_IMAGE_FROM_URL_REQUESTED) {
        next(action);
        const { url }: Payloads.imageLoadFromURLRequested = action.payload;
        const blob = await (await fetch(url)).blob();
        const file = new File([blob], 'demo_image');
        return dispatch(importFileRequested(file));
      } else if (type === Event.IMPORT_FILE_REQUESTED) {
        next(action);
        const file: Payloads.importFileRequested = action.payload;
        console.info('Importing file...', file.name);
        const importer = find(importers, ({ doesMatch }) => doesMatch(file));
        if (importer) {
          const actions = await importer.importFn(file, { });
          console.log('actions', actions);
          next(importFileSucceeded());
          each(actions, dispatch);
        } else {
          console.warn(
            `Type of ${file.name} is not a supported format.`,
          );
          throw new Error('Incompatible file type');
        }
      } else {
        return next(action);
      }
    } catch (e) {
      console.error(
        `Failed to import file.`,
        e,
      );
      return next(importFileFailed(e));
    }
  };

export default middleware;
