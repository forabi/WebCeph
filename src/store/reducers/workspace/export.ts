import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';

const KEY_IS_EXPORTING =  StoreKeys.isExporting;

type IsExporting = StoreEntries.workspace.fileExport.isExporting;

const isInitializedReducer = handleActions<
  IsExporting,
  any
>({
  EXPORT_FILE_REQUESTED: (_, __) => true,
  EXPORT_FILE_FAILED: (_, __) => false,
  EXPORT_FILE_SUCEEDED: (_, __) => false,
}, false);


const KEY_EXPORT_ERROR =  StoreKeys.exportError;

type ExportError = StoreEntries.workspace.fileExport.error;

const exportErrorReducer = handleActions<
  ExportError,
  any
>({
  EXPORT_FILE_REQUESTED: (_, __) => null,
  EXPORT_FILE_FAILED: (_, { payload }) => payload,
  IGNORE_WORKSPACE_ERROR_REQUESTED: (_, __) => null,
}, null);

export default {
  [KEY_IS_EXPORTING]: isInitializedReducer,
  [KEY_EXPORT_ERROR]: exportErrorReducer,
};

export const isExporting = (state: StoreState): IsExporting => state[KEY_IS_EXPORTING];
export const getExportError = (state: StoreState): ExportError => state[KEY_EXPORT_ERROR];
export const hasExportError = createSelector(
  getExportError,
  (error) => error !== null,
);
