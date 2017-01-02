export interface StateProps {
  currentAnalysisId: AnalysisId<ImageType> | null;
  analyses: Array<AnalysisId<ImageType>>;
  isLoading: boolean;
};

export interface DispatchProps {
  onChange<T extends ImageType>(id: AnalysisId<T>, imageType: T): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
