export interface StateProps {
  images: string[];
  showDropzone?: boolean;
  isFileLoading: boolean;
  hasFileLoadFailed: boolean;
};

export interface DispatchProps {
  onRequestFileLoad: (file: File) => any;
};

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
  workspaceId: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
