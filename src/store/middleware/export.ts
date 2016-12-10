import { Store, Dispatch, Middleware } from 'redux';
import { saveAs } from 'file-saver';

import { exportFileSucceeded, exportFileFailed } from 'actions/workspace';

import createExport from 'utils/importers/wceph/v1/export';

import { isActionOfType } from 'utils/store';

const middleware: Middleware = ({ getState }: Store<StoreState>) => (next: Dispatch<any>) => async (action: Action<any>) => {
  if (isActionOfType(action, 'EXPORT_FILE_REQUESTED')) {
    next(action);
    console.info('Exporting file...');
    try {
      const payload = action.payload;
      if (payload.format === 'wceph_v1') {
        const options: WCeph.ExportOptions = { };
        const state = getState();
        const file = await createExport(state, options);
        saveAs(file, file.name);
      } else {
        console.warn(
          `${payload.format} is not a valid export format. ` +
          `Only 'wceph_v1' is a valid export format for now.`
        );
        throw new Error('Incompatible file type');
      }
      return next(exportFileSucceeded(void 0));
    } catch (e) {
      console.error(
        `Failed to export file.`,
        e,
      );
      return next(exportFileFailed(e));
    }
  } else {
    return next(action);
  }
};

export default middleware;
