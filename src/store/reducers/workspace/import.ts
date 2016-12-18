import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';

const KEY_IS_IMPORTING: StoreKey = 'workspace.import.isImporting';
const KEY_IMPORT_ERROR: StoreKey = 'workspace.import.error';

const reducers: Partial<ReducerMap> = {
  [KEY_IS_IMPORTING]: handleActions<typeof KEY_IS_IMPORTING>({
    IMPORT_FILE_REQUESTED: () => true,
    IMPORT_FILE_FAILED: () => false,
    IMPORT_FILE_SUCCEEDED: () => false,
  }, false),
  [KEY_IMPORT_ERROR]: handleActions<typeof KEY_IMPORT_ERROR>({
    IMPORT_FILE_REQUESTED: () => null,
    IMPORT_FILE_FAILED: (_, { payload }) => payload,
    IGNORE_WORKSPACE_ERROR_REQUESTED: () => null,
  }, null),
};

export default reducers;

export const isImporting = (state: StoreState) => state[KEY_IS_IMPORTING];
export const getImportError = (state: StoreState) => state[KEY_IMPORT_ERROR];
export const hasImportError = createSelector(
  getImportError,
  (error) => error !== null,
);
