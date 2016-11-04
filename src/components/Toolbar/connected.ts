import {
  connect,
  MapStateToProps,
  MapDispatchToPropsFunction,
} from 'react-redux';
import { StateProps, DispatchProps, OwnProps } from './props';
import CephaloToolbar from './index';
import {
  setBrightness,
  setContrast,
  setActiveTool,
  flipX, flipY,
  invertColors,
  redo, undo,
  showAnalysisResults,
} from 'actions/workspace';
import {
  canEdit,
  canRedo,
  canUndo,
} from 'store/reducers/workspace';
import {
  getImageBrightness,
  getImageContrast,
  isImageInverted,
} from 'store/reducers/workspace/image';
import {
  getActiveToolId,
} from 'store/reducers/workspace/canvas';

import {
  canShowResults,
  areResultsShown,
} from 'store/reducers/workspace/analysis';

const mapStateToProps: MapStateToProps<StateProps, OwnProps> =
  (state: FinalState): StateProps => {
    return {
      activeToolId: getActiveToolId(state),
      brightness: getImageBrightness(state),
      contrast: getImageContrast(state),
      isImageInverted: isImageInverted(state),
      canEdit: canEdit(state),
      canRedo: canRedo(state),
      canUndo: canUndo(state),
      canShowSummary: !areResultsShown(state) && canShowResults(state),
    };
  };

const mapDispatchToProps: MapDispatchToPropsFunction<DispatchProps, OwnProps> =
  (dispatch: DispatchFunction): DispatchProps => {
    return {
      onBrightnessChange: (value) => dispatch(setBrightness(value)),
      onContrastChange: (value) => dispatch(setContrast(value)),
      onFlipXClick: () => dispatch(flipX()),
      onFlipYClick: () => dispatch(flipY()),
      onInvertToggle: () => dispatch(invertColors()),
      onRedoClick: () => dispatch(redo()),
      onUndoClick: () => dispatch(undo()),
      onToolButtonClick: (id) => dispatch(setActiveTool(id)),
      onShowSummaryClick: () => dispatch(showAnalysisResults()),
    };
  };

export default connect(
  mapStateToProps, mapDispatchToProps
)(CephaloToolbar);
