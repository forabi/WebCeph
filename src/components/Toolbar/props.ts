export interface StateProps {
  canEdit: boolean;
  canRedo: boolean;
  canUndo: boolean;
  activeToolId: string;
  isImageInverted: boolean;
  brightness: number;
  contrast: number;
};

export interface DispatchProps {
  onFlipXClick(): any;
  onFlipYClick(): any;
  onInvertToggle(): any;
  onBrightnessChange(value: number): any;
  onContrastChange(value: number): any;
  onToolButtonClick(id: string): any;
  onUndoClick(): any;
  onRedoClick(): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
