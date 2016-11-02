export interface StateProps {
  top: number | null;
  left: number | null;
  x: number;
  y: number;
  isFlippedX: boolean;
  isFlippedY: boolean;
}

export interface DispatchProps {

}

export interface OwnProps extends React.HTMLAttributes<HTMLDivElement> {
  width: number;
  height: number;
  margin: number;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
