import { Rect } from 'utils/math';

export interface StateProps {
  objects: ReadonlyArray<{
    label: string;
    symbol: string;
    value: GeometricalObject;
  }>;
  boundingRect: Rect;
}

export interface DispatchProps {

}

export interface OwnProps {

}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
