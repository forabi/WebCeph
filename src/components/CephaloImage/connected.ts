import {
  connect,
  MapStateToProps,
} from 'react-redux';

import CephaloLens from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getImageSrc,
} from 'store/reducers/workspace/image';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: StoreState, { imageId }: OwnProps) => {
    return {
      src: getImageSrc(state)(imageId),
    };
  };

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps,
)(CephaloLens);


export default connected;
