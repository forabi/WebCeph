export interface StateProps {
  results: Array<CategorizedAnalysisResult<Category>>;
};

export interface DispatchProps {
  onRequestClose(): any;
}

export type ConnectableProps = StateProps & DispatchProps;

export type OwnProps = {
  open: boolean;
};

export type Props = ConnectableProps & OwnProps;

export default Props;
