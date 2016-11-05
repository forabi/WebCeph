import { handleActions } from 'redux-actions';
import { createSelector } from 'reselect';
import { Event, StoreKeys } from 'utils/constants';
import { printUnexpectedPayloadWarning } from 'utils/debug';

type WorkspaceMode = StoreEntries.workspace.mode;

const KEY_WORKSPACE_MODE = StoreKeys.workspaceMode;
const defaultState: WorkspaceMode = 'tracing';

const workspaceModeReducer = handleActions<
  WorkspaceMode,
  Payloads.setWorkspaceMode
>(
  {
    [Event.SET_WORKSPACE_MODE_REQUESTED]: (
      state: WorkspaceMode, { type, payload: mode }: Action<Payloads.addManualLandmark>
    ) => {
      if (mode === undefined) {
        printUnexpectedPayloadWarning(type, state);
        return state;
      }
      return mode;
    },
    [Event.RESET_WORKSPACE_REQUESTED]: () => defaultState,
  },
  defaultState,
);

export default {
  [KEY_WORKSPACE_MODE]: workspaceModeReducer,
};

export const getWorkspaceMode = (state: GenericState) => {
  return state[KEY_WORKSPACE_MODE] as WorkspaceMode;
};

export const isTracingMode = createSelector(
  getWorkspaceMode,
  (mode) => mode === 'tracing',
);

