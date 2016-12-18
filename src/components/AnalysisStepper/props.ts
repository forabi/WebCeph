export interface OwnProps {
  className?: string;
}

export interface StateProps {
  steps: CephLandmark[];
  highlightedStep: string | null;
  getStepState(step: CephLandmark): StepState;
  getStepValue(step: CephLandmark): number | undefined;
  isStepRemovable(step: CephLandmark): boolean;
  isStepSkippable(step: CephLandmark): boolean;
}

export interface DispatchProps {
  onRemoveLandmarkClick(step: CephLandmark): void;
  onEditLandmarkClick(step: CephLandmark): void;
  onStepMouseEnter(step: CephLandmark): any;
  onStepMouseLeave(step: CephLandmark): any;
}

export interface AdditionalPropsToMerge {

}

export type ConnectableProps = StateProps & DispatchProps & AdditionalPropsToMerge;

export type Props = OwnProps & StateProps & DispatchProps;

export default Props;
