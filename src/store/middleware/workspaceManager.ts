import { Store, Dispatch, Middleware } from 'redux';

import { isLastWorkspaceUsed, getLastWorkspaceId } from 'store/reducers/workspace';

import { isActionOfType } from 'utils/store';

import { setActiveWorkspace } from 'actions/workspace';

const middleware: Middleware = ({ getState }: Store<StoreState>) =>
  (next: Dispatch<GenericAction>) => (action: GenericAction) => {
    if (isActionOfType(action, 'ADD_NEW_WORKSPACE')) {
      const state = getState();
      const lastWorkspaceId = getLastWorkspaceId(state);
      const { payload: { id } } = action;
      if (lastWorkspaceId === null || isLastWorkspaceUsed(state)) {
        next(action);
        return next(setActiveWorkspace({ id }));
      } else {
        console.info(
          'An empty workspace is available. ' +
          'Switching to that workspace instead of creating a new one.',
        );
        return next(setActiveWorkspace({ id: lastWorkspaceId }));
      }
    } else {
      return next(action);
    }
  };

export default middleware;
