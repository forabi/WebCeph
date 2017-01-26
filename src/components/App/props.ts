export interface OwnProps {
  className?: string;
  userAgent: string;
}

export interface StateProps {
  shouldCheckCompatibility: boolean;
  isReady: boolean;
  keyMap: KeyboardMap;
}


export interface DispatchProps {
  dispatch: GenericDispatch;
  handlers: KeyboardHandlers;
}

export interface MergeProps {
  onComponentMount: () => any;
}

export type ConnectableProps = StateProps & DispatchProps & MergeProps;

export type Props = OwnProps & StateProps & DispatchProps & MergeProps;

export default Props;
