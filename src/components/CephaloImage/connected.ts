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
  getImageData,
  getImageWidth,
  getImageHeight,
} from 'store/reducers/workspace/image';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState) => {
    return {
      src: getImageData(state),
      height: getImageHeight(state),
      width: getImageWidth(state),
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
)(CephaloLens);


export default connected;
