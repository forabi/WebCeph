import { handleAction } from 'redux-actions';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { wrapWithDefaultState, reduceReducers } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';
import { createSelector } from 'reselect';
import { getStepsForLandmarks } from 'analyses/helpers';
import { findStepBySymbol } from 'store/reducers/workspace/analysis';

export const KEY_HIGHLIGHTED_STEP =  StoreKeys.highlightedStep;

type State = StoreEntries.workspace.canvas.highlightedStep;
const defaultState: State = null;

const highlightStep = handleAction<State, Payloads.highlightStep>(
  Event.HIGHLIGHT_STEP_ON_CANVAS_REQUESTED,
  (state, { payload, type }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return payload;
  },
);

const unhighlightStep = handleAction<State, Payloads.unhighlightStep>(
  Event.HIGHLIGHT_STEP_ON_CANVAS_REQUESTED,
  (state, { payload, type }) => {
    if (payload !== undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return null;
  },
);

const highlightedStep = wrapWithDefaultState(
  reduceReducers<State, any>(highlightStep, unhighlightStep),
  defaultState,
);

export default {
  [KEY_HIGHLIGHTED_STEP]: highlightedStep,
};

export const getHighlightedStep = (state: GenericState) => state[KEY_HIGHLIGHTED_STEP] as State;

export const getHighlightedLandmarks = createSelector(
  getHighlightedStep,
  findStepBySymbol,
  (highlightedStep, findStepBySymbol): CephaloLandmark[] => {
    if (highlightedStep !== null) { 
      const step = findStepBySymbol(highlightedStep);
      if (step !== null) {
        return getStepsForLandmarks([step]);
      }
    }
    return [];
  }
);
