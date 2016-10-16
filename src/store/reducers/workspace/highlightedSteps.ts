import { handleActions } from 'redux-actions';
import assign from 'lodash/assign';
import omit from 'lodash/omit';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { printUnexpectedPayloadWarning } from '../../../utils/debug';
import { Event } from '../../../utils/constants';

export const KEY_HIGHLIGHTED_STEPS =  'cephalo.workspace.canvas.highlightedSteps';

const defaultState = { };

const highlightedSteps = handleActions<StoreEntries.workspace.canvas.highlightedSteps, Payloads.highlightStepsOnCanvas>({
  [Event.HIGHLIGHT_STEPS_ON_CANVAS_REQUESTED]: (state, { payload, type }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return reduce(
      map(payload, (symbol : string) => ({ [symbol]: true })),
      assign,
      assign({ }, state),
    );
  },
  [Event.UNHIGHLIGHT_STEPS_ON_CANVAS_REQUESTED]: (state, { payload, type }) => {
    if (payload === undefined) {
      printUnexpectedPayloadWarning(type, state);
      return state;
    }
    return omit(state, ...payload) as typeof state;
  }
}, defaultState);

export default {
  [KEY_HIGHLIGHTED_STEPS]: highlightedSteps,
};

export const getHighlightedSteps = (state: StoreState) => state[KEY_HIGHLIGHTED_STEPS];
