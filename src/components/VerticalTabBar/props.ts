export interface OwnProps {
  className?: string;
}

export interface StateProps {
  tabs: string[];
  activeTabId: string | null;
  canAddWorkspace: boolean;
}


export interface DispatchProps {
  onTabChanged: (id: string) => any;
  onAddNewTab: () => any;
}

export interface MergeProps {
}

export type ConnectableProps = StateProps & DispatchProps & MergeProps;

export type Props = OwnProps & StateProps & DispatchProps & MergeProps;

export default Props;
