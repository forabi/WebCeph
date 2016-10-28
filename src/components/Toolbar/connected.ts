import { connect } from 'react-redux';
import noop from 'lodash/noop';
import { StateProps, DispatchProps, UnconnectableProps } from './props';
import CephaloToolbar from './index';
import { setBrightness, setContrast, flipX, invertColors, redo, undo } from 'actions/workspace';
import {
  getActiveToolId,
  getBrightness,
  getContrast,
  isImageInverted,
  canEdit,
  canRedo,
  canUndo,
  setActiveTool,
} from 'store/selectors';

const mapStateToProps = (EnhancedState: EnhancedState<StoreState>): StateProps => {
  const state = EnhancedState.present;
  return {
    activeToolId: getActiveToolId(state),
    brightness: getBrightness(state),
    contrast: getContrast(state),
    isImageInverted: isImageInverted(state),
    canEdit: canEdit(state),
    canRedo: canRedo(state),
    canUndo: canUndo(state),
  };
};

const mapDispatchToProps = (dispatch: DispatchFunction): DispatchProps => {
  return {
    onBrightnessChange: (value) => dispatch(setBrightness(value)),
    onContrastChange: (value) => dispatch(setContrast(value)),
    onFlipXClick: () => dispatch(flipX()),
    onFlipYClick: noop,
    onInvertToggle: () => dispatch(invertColors()),
    onRedoClick: () => dispatch(redo()),
    onUndoClick: () => dispatch(undo()),
    setActiveTool: (id) => dispatch(setActiveTool(id)),
  };
};

export default connect(
  mapStateToProps, mapDispatchToProps
)(CephaloToolbar) as React.SFCFactory<UnconnectableProps>;
