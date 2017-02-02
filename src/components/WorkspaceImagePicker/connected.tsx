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
  traceImage,
} from 'actions/workspace';

import {
  hasImportFailed,
} from 'store/reducers/workspace/settings';

import {
  getWorkspaceImageIds,
  shouldShowLoadingFileIndicator,
} from 'store/reducers/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { workspaceId }: OwnProps) => {
    return {
      images: getWorkspaceImageIds(state)(workspaceId),
      isFileLoading: shouldShowLoadingFileIndicator(state)(workspaceId),
      hasFileLoadFailed: hasImportFailed(state)(workspaceId),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch, { workspaceId }: OwnProps) => (
    {
      onRequestFileLoad: (file) => dispatch(importFileRequested({ file, workspaceId })),
      onImageClick: (imageId) => dispatch(traceImage({ imageId, workspaceId })),
    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(WorkspaceSwitcher);

export default connected;
