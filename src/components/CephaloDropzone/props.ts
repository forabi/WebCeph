export interface StateProps {
  supportedImageTypes?: string[];
  allowsMultipleFiles?: boolean;
}

export interface DispatchProps {
  onFilesDropped(files: File[]): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  stageId: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
