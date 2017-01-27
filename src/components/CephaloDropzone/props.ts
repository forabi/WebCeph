export interface StateProps {
  supportedImageTypes?: string[];
  allowsMultipleFiles?: boolean;
  isOffline: boolean;
}

export interface DispatchProps {
  onFilesDropped(files: File[]): any;
  onDemoButtonClick(): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  workspaceId: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
