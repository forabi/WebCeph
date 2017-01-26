import { addNewWorkspace } from 'actions/workspace';

import uniqueId from 'lodash/uniqueId';
import mapValues from 'lodash/mapValues';

export const keyboardActions: KeyboardActionCreators = {
  ADD_NEW_WORKSPACE: () => addNewWorkspace({ id: uniqueId('workspace_') }),
};

export const keyMap: KeyboardMap = {
  ADD_NEW_WORKSPACE: 'n',
};

export const createHandlers = (dispatch: GenericDispatch): KeyboardHandlers => {
  return mapValues(
    keyboardActions,
    (actionCreator) => (e: KeyboardEvent) => {
      dispatch(actionCreator());
      e.stopPropagation();
      e.preventDefault();
    },
  ) as KeyboardHandlers;
};
