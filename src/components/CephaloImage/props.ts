export interface StateProps {
  src: string | null;
  width: number | null;
  height: number | null;
  children?: React.ReactChild[];
}

export interface DispatchProps {
  onMouseMove?(x: number, y: number, e: React.MouseEvent<SVGImageElement>): any;
  onMouseDown?(x: number, y: number, e: React.MouseEvent<SVGImageElement>): any;
}

export interface OwnProps {
  isFlippedX?: boolean;
  isFlippedY?: boolean;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
