export interface OwnProps {
  className?: string;
}

export interface StateProps {
  isSummaryShown: boolean;
}

export interface DispatchProps {

}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = OwnProps & StateProps & DispatchProps;

export default Props;
