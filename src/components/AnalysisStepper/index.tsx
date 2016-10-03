import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import pure from 'recompose/pure';

const classes = require('./style.scss');

interface AnalysisStepperProps {
  className?: string,
  steps: Step[];
  getStepState(step: Step): stepState;
  getStepValue(step: Step): number | undefined;
  showResults(): void;
  removeLandmark(landmark: CephaloLandmark): void;
  editLandmark(landmark: CephaloLandmark): void;
}

import IconPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import IconHourglass from 'material-ui/svg-icons/action/hourglass-empty';
import IconDone from 'material-ui/svg-icons/action/done';

const ICON_DONE       = <IconDone color="green"/>;
const ICON_CURRENT    = <IconPlayArrow color="blue" />;
const ICON_PENDING    = <IconHourglass />;
const ICON_EVALUATING = <IconHourglass className={classes.icon_pending__evaluating} />;

const icons: { [id: string]: JSX.Element } = {
  done: ICON_DONE,
  current: ICON_CURRENT,
  pending: ICON_PENDING,
  evaluating: ICON_EVALUATING,
};

import { descriptions } from './strings';

const getDescriptionForStep= (landmark: CephaloLandmark) => {
  return descriptions[landmark.symbol] || landmark.description || null;
}

const getTitleForStep = (landmark: CephaloLandmark) => {
  if (landmark.type === 'point') {
    return `Set point ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'line') {
    return `Draw line ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'angle') {
    return `Calculate angle ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  }
  throw new TypeError(`Cannot handle this type of landmarks (${landmark.type})`);
}

export const AnalysisStepper = pure((props: AnalysisStepperProps) => {
  const {
    steps,
    getStepState,
    showResults,
    getStepValue,
    removeLandmark, editLandmark,
  } = props;
  return (
    <List className={props.className}>
    {
      steps.map((step) => {
        const value = getStepValue(step);
        return (
          <div key={step.symbol}>
            <ListItem
              primaryText={getTitleForStep(step)}
              secondaryText={getDescriptionForStep(step) || undefined}
              leftIcon={icons[getStepState(step)]}
              rightIcon={ step.type === 'angle' && typeof value === 'number' ? <span>{value.toFixed(1)}</span> : undefined}
            />
          </div>
        );
      })
    }
    </List>
  );
});

export default AnalysisStepper;