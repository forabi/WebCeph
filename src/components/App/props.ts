export interface OwnProps {
  className?: string;
  userAgent: string;
}

export type StateProps = {
  shouldCheckCompatibility: boolean;
  shouldShowWorkspaceSwitcher: boolean;
  keyMap: KeyboardMap;
  isReady: boolean;
  activeWorkspaceId: string;
  locale: string;
  messages: ReactIntl.Messages;
  title: string | null;
};

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
