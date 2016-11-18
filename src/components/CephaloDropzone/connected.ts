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
  loadSampleImage,
} from 'actions/workspace';
import {
  DEMO_IMAGE_URL,
} from 'utils/config';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = () => ({ });

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onFilesDropped: (files) => dispatch(loadImageFile(files[0])),
    onDemoButtonClick: () => dispatch(loadSampleImage({ url: DEMO_IMAGE_URL })),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CephaloDropzone);


export default connected;
