import * as React from 'react';
import { findDOMNode } from 'react-dom';
import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import * as cx from 'classnames';
import { List, ListItem } from 'material-ui/List';
import IconDone from 'material-ui/svg-icons/action/done';
import IconHourglass from 'material-ui/svg-icons/action/hourglass-empty';
import IconPlayArrow from 'material-ui/svg-icons/av/play-arrow';

import findIndex from 'lodash/findIndex';
import findLastIndex from 'lodash/findLastIndex';
import map from 'lodash/map';

import Props from './props';
import { getDescriptionForLandmark, getCommandForStep } from './strings';

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
  private itemToScrollTo: React.ReactInstance | null;
  private hasScrolled = false;

  public componentDidUpdate() {
    if (this.itemToScrollTo !== null) {
      const node = findDOMNode(this.itemToScrollTo);
      if (node) {
        scrollIntoViewIfNeeded(node, false);
        this.hasScrolled = true;
      }
    }
  }

  public render() {
    const {
      className,
      steps,
      getStepState,
      getStepValue,
      highlightedStep,
      isStepRemovable,
      onRemoveLandmarkClick, onEditLandmarkClick,
      onStepMouseEnter, onStepMouseLeave,
    } = this.props;
    const firstPendingIndex = findIndex(steps, (step) => getStepState(step.symbol) === 'current');
    const lastDoneIndex = findLastIndex(steps, (step) => getStepState(step.symbol) === 'done');
    return (
      <div className={cx(classes.root, className)}>
        <List className={classes.list}>
        {
          map(steps, (step, i) => {
            const value = getStepValue(step.symbol);
            const state = getStepState(step.symbol);
            const isDone = state === 'done';
            const isRemovable = isDone && isStepRemovable(step.symbol);
            const shouldScrollTo = (
              i === firstPendingIndex || (
                firstPendingIndex === -1 && i === lastDoneIndex && !this.hasScrolled
              )
            );
            return (
              <div key={step.symbol}>
                <ListItem
                  ref={shouldScrollTo ? this.setScrollTo : undefined}
                  primaryText={getCommandForStep(step)}
                  secondaryText={getDescriptionForLandmark(step) || undefined}
                  leftIcon={icons[state]}
                  rightIcon={
                    (typeof value === 'number' ?
                      <span>{value.toLocaleString('en-US')}</span> : undefined)
                  }
                  onMouseEnter={isDone ? onStepMouseEnter.bind(null, step.symbol) : undefined}
                  onMouseLeave={isDone ? onStepMouseLeave.bind(null, step.symbol) : undefined}
                />
              </div>
            );
          })
        }
        </List>
      </div>
    );
  }

  private setScrollTo = (node: React.ReactInstance | null) => this.itemToScrollTo = node;
};

export default AnalysisStepper;
