import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';

const KEY_IS_EXPORTING =  StoreKeys.isExporting;

type IsExporting = StoreEntries.workspace.fileExport.isExporting;

const isInitializedReducer = handleActions<
  IsExporting,
  any
>({
  [Event.EXPORT_FILE_REQUESTED]: (_, __) => true,
  [Event.EXPORT_FILE_FAILED]: (_, __) => false,
  [Event.EXPORT_FILE_SUCEEDED]: (_, __) => false,
}, false);


const KEY_EXPORT_ERROR =  StoreKeys.exportError;

type ExportError = StoreEntries.workspace.fileExport.error;

const exportErrorReducer = handleActions<
  ExportError,
  any
>({
  [Event.EXPORT_FILE_REQUESTED]: (_, __) => null,
  [Event.EXPORT_FILE_FAILED]: (_, { payload }) => payload,
  [Event.IGNORE_WORKSPACE_ERROR_REQUESTED]: (_, __) => null,
}, null);

export default {
  [KEY_IS_EXPORTING]: isInitializedReducer,
  [KEY_EXPORT_ERROR]: exportErrorReducer,
};

export const isExporting = (state: GenericState): IsExporting => state[KEY_IS_EXPORTING];
export const getExportError = (state: GenericState): ExportError => state[KEY_EXPORT_ERROR];
export const hasExportError = createSelector(
  getExportError,
  (error) => error !== null,
);
