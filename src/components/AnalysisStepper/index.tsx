import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import IconPlayArrow from 'material-ui/svg-icons/av/play-arrow';
import IconHourglass from 'material-ui/svg-icons/action/hourglass-empty';
import IconDone from 'material-ui/svg-icons/action/done';
import { pure } from 'recompose';
import Props from './props';
import { getDescriptionForStep, getTitleForStep } from './strings';
import * as cx from 'classnames';
import map from 'lodash/map';

const classes = require('./style.scss');

const ICON_DONE       = <IconDone color="green"/>;
const ICON_CURRENT    = <IconPlayArrow color="blue" />;
const ICON_PENDING    = <IconHourglass />;
const ICON_EVALUATING = <IconHourglass className={classes.icon_pending__evaluating} />;

const icons: { [id: string]: JSX.Element } = {
  current: ICON_CURRENT,
  done: ICON_DONE,
  evaluating: ICON_EVALUATING,
  pending: ICON_PENDING,
};

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
    <div className={cx(classes.root, props.className)}>
      <List className={classes.list}>
      {
        map(steps, step => {
          const value = getStepValue(step.symbol);
          const state = getStepState(step.symbol);
          const isDone = state === 'done';
          const isRemovable = isDone && isStepRemovable(step.symbol);
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
    </div>
  );
});

export default AnalysisStepper;