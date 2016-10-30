export interface StateProps {

}

export interface DispatchProps {

}

export interface OwnProps {
  className?: string;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = ConnectableProps & OwnProps;

export default Props;
