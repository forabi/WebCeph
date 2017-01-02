import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import CephaloLens from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getImageProps,
  getActiveImageId,
} from 'store/reducers/workspace/image';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState) => {
    const props = getImageProps(state)(getActiveImageId(state)!);
    return {
      src: props.data,
      height: props.height,
      width: props.width,
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
)(CephaloLens);


export default connected;
