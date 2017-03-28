export interface OwnProps {
  className?: string;
}

export interface StateProps {
  currentUserPreferredLocale: string | null;
}


export interface DispatchProps {
  onLocaleChange(newLocale: string): any;
  onLocaleUnset(): any;
}

export interface MergeProps {
}

export type ConnectableProps = StateProps & DispatchProps & MergeProps;

export type Props = OwnProps & StateProps & DispatchProps & MergeProps;

export default Props;
