export interface OwnProps {
  className?: string;
}

export interface StateProps {
  isSummaryShown?: boolean;
  shouldShowStepper?: boolean;
  isReady: boolean;
}

export interface DispatchProps {
  onComponentMount: () => any;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = OwnProps & StateProps & DispatchProps;

export default Props;
