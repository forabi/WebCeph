export interface StateProps {
  hasImage: boolean;
  isLoading: boolean;
  shouldShowLens: boolean;
  mode: WorkspaceMode;
  imageIds: string[];
};

export interface DispatchProps {
  onResize(rect: { top: number, left: number, width: number, height: number }): any;
};

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
