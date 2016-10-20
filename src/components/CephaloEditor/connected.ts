import { connect } from 'react-redux';
import CephaloEditor, { CephaloEditorProps } from './index';

interface ConnectedCephaloEditorProps {
  className?: string;
} 

const mapStateToProps = (EnhancedState: EnhancedState<StoreState>) => {
  const state = EnhancedState.present;
  return {
    activeToolId: getActiveTool(state),
    brightness: getBrightness(state),
    canRedo: canRedoSelector(enhancedState),
    canUndo: canUndoSelector(enhancedState),
    
  } as CephaloEditorProps;
};

const mapDispatchToProps = (dispatch: DispatchFunction) => {
  return {

  };
};

export default connect(
  mapStateToProps, mapDispatchToProps
)(CephaloEditor) as React.PureComponent<ConnectedCephaloEditorProps, { }>;
