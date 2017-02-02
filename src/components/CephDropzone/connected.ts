import {
  connect,
  MapStateToProps,
} from 'react-redux';
import CephaloDropzone from './index';
import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import { isAppOffline } from 'store/reducers/env/connection';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (state) => ({
  isOffline: isAppOffline(state),
});

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
)(CephaloDropzone);


export default connected;
