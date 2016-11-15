import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';

import Lens from './index';

import {
  StateProps,
  DispatchProps,
  OwnProps,
} from './props';

import {
  getActiveImageQuery,
  getImageData,
  getImageSize,
} from 'store/reducers/workspace/image';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState, ) => {
    const query = getActiveImageQuery(state);
    const { width, height } = getImageSize(state, query);
    return {
      src: getImageData(state, query),
      height, width,
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (_) => (
    {
      onMouseDown: () => void 0,
      onMouseMove: () => void 0,
    }
  );

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps
)(Lens);


export default connected;
