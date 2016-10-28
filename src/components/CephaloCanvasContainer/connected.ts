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
import { hasImage } from 'store/reducers/workspace/image';
import { updateCanvasSize } from 'actions/workspace';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> = (enhancedState: EnhancedState<StoreState>) => {
  const { present: state } = enhancedState;
  return {
    hasImage: hasImage(state),
  };
};

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> = (dispatch) => (
  {
    onResize: (width, height) => dispatch(updateCanvasSize(width, height)),
  }
);

const connected = connect<StateProps, DispatchProps, OwnProps>(
  mapStateToProps, mapDispatchToProps,
)(CephaloDropzone);


export default connected;
