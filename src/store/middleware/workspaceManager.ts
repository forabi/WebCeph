import { Store, Dispatch, Middleware } from 'redux';

import { isLastWorkspaceUsed, getLastWorkspaceId } from 'store/reducers/workspace';

import { isActionOfType } from 'utils/store';

const middleware: Middleware = ({ getState }: Store<StoreState>) =>
  (next: Dispatch<GenericAction>) => (action: GenericAction) => {
    if (isActionOfType(action, 'ADD_NEW_WORKSPACE')) {
      const state = getState();
      const lastWorkspaceId = getLastWorkspaceId(state);
      if (lastWorkspaceId === null || isLastWorkspaceUsed(state)) {
        return next(action);
      }
      console.info(
        'An empty workspace is available. ' +
        'Ignoring request to add a new one.',
      );
      return;
    } else {
      return next(action);
    }
  };

export default middleware;
