export interface StateProps {
  currentAnalysisId: string | null;
  analyses: string[];
  isLoading: boolean;
};

export interface DispatchProps {
  onChange(id: string): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export interface OwnProps {
  className?: string;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
