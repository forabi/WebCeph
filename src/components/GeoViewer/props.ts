export interface StateProps {
  objects: ReadonlyArray<{
    label: string;
    symbol: string;
    value: GeometricalObject;
  }>;
  top: number;
  left: number;
  width: number;
  height: number;
  getPropsForPoint: (symbol: string) => any; // @TODO: use partial
  getPropsForVector: (symbol: string) => any; // @TODO: use partial
  getPropsForAngle: (symbol: string) => any; // @TODO: use partial
}

export interface DispatchProps {
}

export interface OwnProps {

}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
