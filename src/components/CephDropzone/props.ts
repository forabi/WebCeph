export interface StateProps {
  supportedImageTypes?: string[];
  allowsMultipleFiles?: boolean;
  isOffline: boolean;
}

export interface DispatchProps {
  
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
  onDemoButtonClick(): any;
  onFilesDrop(files: File[]): any;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
