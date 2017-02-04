import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import uniqueId from 'lodash/uniqueId';

import WorkspaceSwitcher from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  addNewWorkspace,
  setActiveWorkspace,
} from 'actions/workspace';

import {
  getActiveWorkspaceId,
} from 'store/reducers/workspace/activeId';

import {
  isLastWorkspaceUsed,
} from 'store/reducers/workspace';

import {
  getWorkspacesIdsInOrder,
} from 'store/reducers/workspace/order';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState) => {
    return {
      activeTabId: getActiveWorkspaceId(state),
      tabs: getWorkspacesIdsInOrder(state),
      canAddWorkspace: isLastWorkspaceUsed(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch) => (
    {
      onAddNewTab: () => {
        const id = uniqueId('workspace_');
        dispatch(addNewWorkspace({ id }));
        dispatch(setActiveWorkspace({ id }));
      },
      onTabChanged: (id) => dispatch(setActiveWorkspace({ id })),
    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(WorkspaceSwitcher);

export default connected;
