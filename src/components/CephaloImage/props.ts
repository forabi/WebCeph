export interface StateProps {
  src: string | null;
}

export interface DispatchProps {
  onMouseMove?(x: number, y: number, e: React.MouseEvent<SVGImageElement>): any;
  onMouseDown?(x: number, y: number, e: React.MouseEvent<SVGImageElement>): any;
}

export interface OwnProps extends React.DOMAttributes<HTMLImageElement> {
  imageId: string;
  width?: string | number;
  height?: string | number;
  isFlippedX?: boolean;
  isFlippedY?: boolean;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
