import find from 'lodash/find';
import { Store, Dispatch, Middleware } from 'redux';

import { isLastWorkspaceUsed, getLastWorkspaceId } from 'store/reducers/workspace';

import { isActionOfType } from 'utils/store';

import { removeWorkspace } from 'actions/workspace';

const middleware: Middleware = ({ getState, dispatch }: Store<StoreState>) =>
  (next: Dispatch<GenericAction>) => (action: GenericAction) => {
    if (isActionOfType(action, 'SET_ACTIVE_WORKSPACE')) {
      const { payload: { id } } = action;
      const state = getState();
      const lastWorkspaceId = getLastWorkspaceId(state);
      if (lastWorkspaceId !== null && id !== lastWorkspaceId && !isLastWorkspaceUsed(state)) {
        // @TODO: handle unreferenced images
        dispatch(removeWorkspace({
          id: lastWorkspaceId,
          removeUnreferencedImages: false,
        }));
      }
    }
    return next(action);
  };

export default middleware;
