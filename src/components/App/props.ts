export interface OwnProps {
  className?: string;
  userAgent: string;
}

export interface StateProps {
  isSummaryShown?: boolean;
  shouldShowStepper?: boolean;
  shouldCheckCompatibility: boolean;
  isReady: boolean;
}


export interface DispatchProps {
  dispatch: GenericDispatch;
}

export interface MergeProps {
  onComponentMount: () => any;
}

export type ConnectableProps = StateProps & DispatchProps & MergeProps;

export type Props = OwnProps & StateProps & DispatchProps & MergeProps;

export default Props;
