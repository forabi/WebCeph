export interface OwnProps {
  className?: string,;
}

export interface StateProps {
  steps: CephaloLandmark[];
  highlightedStep: string | null;
  getStepState(symbol: string): StepState;
  getStepValue(symbol: string): number | undefined;
  isStepRemovable(symbol: string): boolean;
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
