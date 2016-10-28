export interface StateProps {
  open: boolean;
  results: CategorizedAnalysisResults;
};

export interface DispatchProps {
  onRequestClose(): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export type OwnProps = { };

export type Props = ConnectableProps & OwnProps;

export default Props;
