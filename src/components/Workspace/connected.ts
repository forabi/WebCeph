import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import Workspace from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getWorkspaceMode,
} from 'store/reducers/workspace/settings';

import {
  canvasResized,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { workspaceId }: OwnProps) => {
    return {
      mode: getWorkspaceMode(state)(workspaceId),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch, { workspaceId }: OwnProps) => (
    {
      onResize: (contentRect) => dispatch(canvasResized({ workspaceId, contentRect})),
    }
  );

const ConnectedWorkspace = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(Workspace);


export default ConnectedWorkspace;
