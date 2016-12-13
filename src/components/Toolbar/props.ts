export interface StateProps {
  canEdit: boolean;
  canRedo: boolean;
  canUndo: boolean;
  activeToolId: string;
  isImageInverted: boolean;
  brightness: number;
  contrast: number;
  canShowSummary: boolean;
  canExport: boolean;
  isExporting: boolean;
};

export interface DispatchProps {
  onFlipXClick(): any;
  onFlipYClick(): any;
  onInvertToggle(): any;
  onBrightnessChange(value: number): any;
  onContrastChange(value: number): any;
  onToolButtonClick(id: ToolId): any;
  onUndoClick(): any;
  onRedoClick(): any;
  onShowSummaryClick(): any;
  onExportClick(): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
