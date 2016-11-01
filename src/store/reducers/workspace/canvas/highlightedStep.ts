import { handleAction } from 'redux-actions';
import { printUnexpectedPayloadWarning } from 'utils/debug';
import { wrapWithDefaultState, reduceReducers } from 'store/helpers';
import { Event, StoreKeys } from 'utils/constants';

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
  Event.UNHIGHLIGHT_STEP_ON_CANVAS_REQUESTED,
  (state, { payload, type }) => {
    if (payload !== undefined) {
      printUnexpectedPayloadWarning(type, state, typeof payload);
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
