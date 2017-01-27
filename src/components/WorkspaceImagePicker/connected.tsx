import * as React from 'react';
import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import TracingViewer from 'components/TracingViewer';

import WorkspaceSwitcher from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  importFileRequested,
} from 'actions/workspace';

import {
  getActiveWorkspaceId,
} from 'store/reducers/workspace/activeId';

import {
  getActiveWorkspaceImageIds,
} from 'store/reducers/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState) => {
    return {
      images: getActiveWorkspaceImageIds(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch, { workspaceId }: OwnProps) => (
    {
      onRequestFileLoad: (file) => dispatch(importFileRequested({ file, workspaceId })),
    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(WorkspaceSwitcher);

export default connected;
