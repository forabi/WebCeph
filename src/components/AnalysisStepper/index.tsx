import * as React from 'react';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import RaisedButton from 'material-ui/RaisedButton';
import has from 'lodash/has';

export type stepState = 'done' | 'current' | 'pending';
export type Step = CephaloLandmark & { title: string, state: stepState };

interface AnalysisStepperProps {
  className?: string,
  steps: Step[],
  isAnalysisComplete: boolean,
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

const icons: { [id: string]: JSX.Element } = {
  done: ICON_DONE,
  current: ICON_CURRENT,
  pending: ICON_PENDING,
};

export const AnalysisStepper = (props: AnalysisStepperProps) => {
  const {
    steps,
    isAnalysisComplete,
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
    return (
      <List className={props.className}>
      {
        steps.map((step) => {
          const stepState = step.state;
          return (
            <div key={step.symbol}>
              <ListItem
                primaryText={step.title}
                secondaryText={step.description}
                leftIcon={icons[stepState]}
              />
            </div>
          );
        })
      }
      </List>
    );
  }
};

import { getStepsForAnalysis } from '../../analyses/helpers';
import { descriptions } from './strings';

const getDescriptionForStep: (landmark: CephaloLandmark) => string | null = landmark => {
  return descriptions[landmark.symbol] || landmark.description || null;
}

const getTitleForStep = (landmark: CephaloLandmark) => {
  if (landmark.type === 'point') {
    return `Set point ${landmark.symbol} ${ landmark.name ? `(${landmark.name})` : '' }`;
  } else if (landmark.type === 'line') {
    return `Draw line ${landmark.symbol} ${ landmark.name ? `(${landmark.name})` : '' }`;
  } else if (landmark.type === 'angle') {
    return `Calculate angle ${landmark.symbol} ${ landmark.name ? `(${landmark.name})` : '' }`;
  }
  throw new TypeError(`Cannot handle this type of landmarks (${landmark.type})`);
}

const getStepState = (state: StoreState) => (landmark: CephaloLandmark) => {
  if (has(state['cephalo.workspace.landmarks'], landmark.symbol)) {
    return 'done' as stepState;
  } else {
    return 'pending' as stepState;
  }
}

const mapLandmarkToStep = (state: StoreState) => function (landmark: CephaloLandmark): Step {
  return Object.assign({ }, landmark, {
    title: getTitleForStep(landmark),
    description: getDescriptionForStep(landmark),
    state: getStepState(state)(landmark),
  });
}

const ConnectedAnalysisStepper = connect(
  (state: StoreState) => {
    const activeAnalysis = state['cephalo.workspace.activeAnalysis'];
    if (activeAnalysis !== null) {
      return {
        steps: (
          getStepsForAnalysis(activeAnalysis).map(mapLandmarkToStep(state))
        ) as Step[],
      };
    } else {
      return {
        steps: [],
      };
    }
  },
)(AnalysisStepper);

export default ConnectedAnalysisStepper;