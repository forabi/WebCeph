import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import { pure } from 'recompose';
import Props from './props';

const classes = require('./style.scss');

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

const getDescriptionForStep = (landmark: CephaloLandmark) => {
  return descriptions[landmark.symbol] || landmark.description || null;
}

const getTitleForStep = (landmark: CephaloLandmark) => {
  if (landmark.type === 'point') {
    return `Set point ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'line') {
    return `Draw line ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'angle') {
    return `Calculate angle ${landmark.symbol}${ landmark.name ? ` (${landmark.name})` : '' }`;
  } else if (landmark.type === 'distance') {
    return `Measure distance between points ${landmark.components[0].symbol} and ${landmark.components[1].symbol}`
  } else if (landmark.type === 'sum') {
    return `Calculate ${landmark.name || landmark.symbol || landmark.components.map(c => c.symbol).join(' + ')}`
  }
  console.warn('Could not get title for step of type ' + landmark.type as string);
  return undefined;
}

export const AnalysisStepper = pure((props: Props) => {
  const {
    steps,
    getStepState,
    getStepValue,
    isStepRemovable,
    onRemoveLandmarkClick, onEditLandmarkClick,
    onStepMouseEnter, onStepMouseLeave,
  } = props;
  return (
    <List className={props.className}>
    {
      steps.map(step => {
        const value = getStepValue(step);
        const state = getStepState(step);
        const isDone = state === 'done';
        const isRemovable = isDone && isStepRemovable(step);
        return (
          <div key={step.symbol}>
            <ListItem
              primaryText={getTitleForStep(step)}
              secondaryText={getDescriptionForStep(step) || undefined}
              leftIcon={icons[state]}
              rightIcon={
                (typeof value === 'number' ? 
                  <span>{value.toFixed(1)}</span> : undefined)
              }
              onMouseEnter={isDone ? () => onStepMouseEnter(step.symbol) : undefined}
              onMouseLeave={isDone ? () => onStepMouseLeave(step.symbol) : undefined}
            />
          </div>
        );
      })
    }
    </List>
  );
});

export default AnalysisStepper;