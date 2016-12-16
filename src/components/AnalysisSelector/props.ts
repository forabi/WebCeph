export interface StateProps {
  currentAnalysisId: AnalysisId<ImageType> | null;
  analyses: Array<AnalysisId<ImageType>>;
  isLoading: boolean;
};

export interface DispatchProps {
  onChange(id: AnalysisId<ImageType>): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
