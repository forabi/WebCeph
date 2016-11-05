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
  getImageData,
  getImageSize,
} from 'store/reducers/workspace/image';

import {
  getActiveTreatmentStageId,
} from 'store/reducers/workspace/analysis/tracing/manualLandmarks';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState, ) => {
    const stageId = getActiveTreatmentStageId(state);
    const { width, height } = getImageSize(state)(stageId);
    return {
      src: getImageData(state)(stageId),
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
