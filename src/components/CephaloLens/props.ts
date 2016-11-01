export interface StateProps {
  src: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  top: number | null;
  left: number | null;
  x: number;
  y: number;
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
