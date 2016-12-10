import { AngleProps, VectorProps, PointProps } from './index';

export interface StateProps extends React.SVGAttributes<SVGElement> {
  objects: ReadonlyArray<{
    label: string;
    symbol: string;
    value: GeometricalObject;
  }>;
  top: number;
  left: number;
  width: number;
  height: number;
  getPropsForPoint: (symbol: string) => Partial<PointProps>;
  getPropsForVector: (symbol: string) => Partial<VectorProps>;
  getPropsForAngle: (symbol: string) => (
    Pick<AngleProps, 'boundingRect' | 'vectors' | 'symbol'> & Partial<AngleProps>
  );
}

export interface DispatchProps {
}

export interface OwnProps {

}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
