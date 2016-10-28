export interface OwnProps {
  className?: string,
}

export interface StateProps {
  steps: Step[];
  getStepState(step: Step): StepState;
  getStepValue(step: Step): number | undefined;
}

export interface DispatchProps {
  onRemoveLandmarkClick(symbol: string): void;
  onEditLandmarkClick(landmark: CephaloLandmark): void;
  onStepMouseEnter(symbol: string): any;
  onStepMouseLeave(symbol: string): any;
}

export interface AdditionalPropsToMerge {

}

export type ConnectableProps = StateProps & DispatchProps & AdditionalPropsToMerge;

export type Props = OwnProps & StateProps & DispatchProps;

export default Props;
