import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import { getTracingImageId } from 'store/reducers/workspace/settings';

import { importFileRequested, loadImageFromURL } from 'actions/workspace';

import TracingEditor from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { workspaceId }: OwnProps): StateProps => {
    return {
      imageId: getTracingImageId(state)(workspaceId),
    };
  };

import { DEMO_IMAGE_URL as url } from 'utils/config';

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch: GenericDispatch, { workspaceId }: OwnProps): DispatchProps => {
    return {
      onFilesDrop: ([file]) => dispatch(importFileRequested({ file, workspaceId })),
      onDemoButtonClick: () => dispatch(loadImageFromURL({ url, workspaceId })),
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(TracingEditor);


export default connected;
