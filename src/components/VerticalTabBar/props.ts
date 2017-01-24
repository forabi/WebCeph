export interface OwnProps {
  className?: string;
}

export interface StateProps {
  activeTabId: number;
}


export interface DispatchProps {
  onTabChanged: (i: number) => any;
  onAddNewTab: () => any;
}

export interface MergeProps {
}

export type ConnectableProps = StateProps & DispatchProps & MergeProps;

export type Props = OwnProps & StateProps & DispatchProps & MergeProps;

export default Props;
