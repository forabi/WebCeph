import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

const KEY_IS_EXPORTING: StoreKey = 'workspace.export.isExporting';
const KEY_EXPORT_ERROR: StoreKey = 'workspace.export.error';

const reducers: Partial<ReducerMap> = {
  [KEY_IS_EXPORTING]: handleActions<typeof KEY_IS_EXPORTING>({
    EXPORT_FILE_REQUESTED: () => true,
    EXPORT_FILE_FAILED: () => false,
    EXPORT_FILE_SUCCEEDED: () => false,
  }, false),
  [KEY_EXPORT_ERROR]: handleActions<typeof KEY_EXPORT_ERROR>({
    EXPORT_FILE_REQUESTED: () => null,
    EXPORT_FILE_FAILED: (_, { payload }) => payload,
    IGNORE_WORKSPACE_ERROR_REQUESTED: () => null,
  }, null),
};

export default reducers;

export const isExporting = (state: StoreState) => state[KEY_IS_EXPORTING];
export const getExportError = (state: StoreState) => state[KEY_EXPORT_ERROR];
export const hasExportError = createSelector(
  getExportError,
  (error) => error !== null,
);
