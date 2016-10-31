import * as React from 'react';
import { findDOMNode } from 'react-dom';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import * as cx from 'classnames';
import { List, ListItem } from 'material-ui/List';
import IconDone from 'material-ui/svg-icons/action/done';
import IconHourglass from 'material-ui/svg-icons/action/hourglass-empty';
import IconPlayArrow from 'material-ui/svg-icons/av/play-arrow';

import findIndex from 'lodash/findIndex';
import map from 'lodash/map';

import Props from './props';
import { getDescriptionForStep, getTitleForStep } from './strings';

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

export class AnalysisStepper extends React.PureComponent<Props, { }> {
  private firstPending: React.ReactInstance | null;

  public componentDidUpdate() {
    if (this.firstPending !== null) {
      const node = findDOMNode(this.firstPending);
      scrollIntoViewIfNeeded(node, false);
    }
  }

  public render() {
    const {
      className,
      steps,
      getStepState,
      getStepValue,
      isStepRemovable,
      onRemoveLandmarkClick, onEditLandmarkClick,
      onStepMouseEnter, onStepMouseLeave,
    } = this.props;
    const firstPendingIndex = findIndex(steps, (step) => getStepState(step.symbol) === 'current');
    return (
      <div className={cx(classes.root, className)}>
        <List className={classes.list}>
        {
          map(steps, (step, i) => {
            const value = getStepValue(step.symbol);
            const state = getStepState(step.symbol);
            const isDone = state === 'done';
            const isRemovable = isDone && isStepRemovable(step.symbol);
            return (
              <div key={step.symbol}>
                <ListItem
                  ref={(i === firstPendingIndex || firstPendingIndex === -1) ? this.setFirstPending : undefined}
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
  }

  private setFirstPending = (node: React.ReactInstance | null) => this.firstPending = node;
};

export default AnalysisStepper;
