export interface StateProps {
  supportedImageTypes?: string[];
  allowsMultipleFiles?: boolean;
}

export interface DispatchProps {
  onFilesDropped(files: File[]): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {

};

export type Props = ConnectableProps & OwnProps;

export default Props;
