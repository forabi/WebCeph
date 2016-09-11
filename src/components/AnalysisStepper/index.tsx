import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import { Landmark } from '../../analyses/helpers';
import RaisedButton from 'material-ui/RaisedButton';

export type stepState = 'done' | 'current' | 'pending';
export type Step = CephaloLandmark & { title: string, state: stepState };

type isStepDoneFn = (step: Step, i: number) => boolean;
type isCurrentStepFn = (step: Step, i: number) => boolean;

interface AnalysisStepperProps {
  className?: string,
  steps: Step[],
  isStepDone: isStepDoneFn,
  currentStep: number,
  isAnalysisComplete: boolean,
  getTitleForStep(step: Step): string;
  getDescriptionForStep(step: Step): string | null;
  showResults(): void;
  removeLandmark(landmark: CephaloLandmark): void;
  editLandmark(landmark: CephaloLandmark): void;
}

import IconPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import IconHourglass from 'material-ui/svg-icons/action/hourglass-empty';
import IconDone from 'material-ui/svg-icons/action/done';

const ICON_DONE    = <IconDone      color="green" />;
const ICON_CURRENT = <IconPlayArrow color="blue"  />;
const ICON_PENDING = <IconHourglass               />;

type stepState = 'done' | 'current' | 'pending';

interface StepStateHelpers {
  isStepDone: isStepDoneFn;
  isCurrentStep: isCurrentStepFn;
}

function getStepState(s: Step, i: number, { isStepDone, isCurrentStep }: StepStateHelpers): stepState {
  if (isStepDone(s, i)) {
    return 'done';
  } else if (isCurrentStep(s, i)) {
    return 'current';
  }
  return 'pending';
}

const getStepStateIcon = (state: stepState) => {
  if (state === 'done') {
    return ICON_DONE;
  } else if (state === 'current') {
    return ICON_CURRENT;
  } else {
    return ICON_PENDING;
  }
}


export default (props: AnalysisStepperProps) => {
  const {
    steps,
    isAnalysisComplete,
    getTitleForStep, getDescriptionForStep,
    isStepDone, currentStep,
    showResults,
    removeLandmark, editLandmark,
  } = props;
  if (isAnalysisComplete) {
    return (
      <div className={props.className}>
        Analysis complete.
        <RaisedButton label="Show results" primary onClick={showResults} />
      </div>
    );
  } else {
    const isCurrentStep = (step: Step, i: number) => i === currentStep;
    return (
      <List className={props.className}>
      {
        steps.map((step, i) => {
          const stepState = getStepState(step, i, { isStepDone, isCurrentStep });
          return (
            <div key={step.symbol}>
              <ListItem
                primaryText={getTitleForStep(step)}
                secondaryText={getDescriptionForStep(step)}
                leftIcon={getStepStateIcon(stepState)}
              />
            </div>
          );
        })
      }
      </List>
    );
  }
};