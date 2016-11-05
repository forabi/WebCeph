import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import CephaloDropzone from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';
import {
  loadImageFile,
} from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = () => ({ });

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch, { stageId }) => (
  {
    onFilesDropped: (files) => dispatch(loadImageFile({ stageId, file: files[0] })),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CephaloDropzone);


export default connected;
