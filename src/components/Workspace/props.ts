export interface StateProps {
  isLoading: boolean;
  shouldShowLens?: boolean;
  hasError: boolean;
  errorMessage: string | null;
  mode: WorkspaceMode;
  imageIds: string[];
};

export interface DispatchProps {
  onResize(rect: { top: number, left: number, width: number, height: number }): any;
  onRequestDismissError(): any;
};

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
