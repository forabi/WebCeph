import { handleActions } from 'utils/store';
import { createSelector } from 'reselect';
import Tools from 'editorTools';

const KEY_CANVAS_DIMENSIONS: StoreKey = 'workspace.canvas.dimensions';
const KEY_CANVAS_MOUSE_POSITION: StoreKey = 'workspace.canvas.mouse.position';
const KEY_CANVAS_TOOL_ID: StoreKey = 'workspace.canvas.tools.activeToolId';
const KEY_HIGHLIGHTED_STEP: StoreKey = 'workspace.canvas.highlightedStep';
const KEY_SCALE: StoreKey = 'workspace.canvas.scale.value';
const KEY_SCALE_ORIGIN: StoreKey = 'workspace.canvas.scale.offset';

const reducers: Partial<ReducerMap> = {
  [KEY_CANVAS_DIMENSIONS]: handleActions<typeof KEY_CANVAS_DIMENSIONS>(
    {
      CANVAS_RESIZED: (_, { payload }) => payload,
    },
    { height: 750, width: 550, top: 0, left: 0 },
  ),
  [KEY_CANVAS_MOUSE_POSITION]: handleActions<typeof KEY_CANVAS_MOUSE_POSITION>(
    {
      MOUSE_POSITION_CHANGED: (_, { payload }) => payload,
    },
    null,
  ),
  [KEY_CANVAS_TOOL_ID]: handleActions<typeof KEY_CANVAS_TOOL_ID>(
    {
      SET_ACTIVE_TOOL_REQUESTED: (_, { payload }) => payload,
    },
    'ADD_POINT',
  ),
  [KEY_HIGHLIGHTED_STEP]: handleActions<typeof KEY_HIGHLIGHTED_STEP>(
    {
      HIGHLIGHT_STEP_ON_CANVAS_REQUESTED: (_, { payload }) => payload.symbol,
      UNHIGHLIGHT_STEP_ON_CANVAS_REQUESTED: (_, __) => null,
    },
    null,
  ),
  [KEY_SCALE]: handleActions<typeof KEY_SCALE>(
    {
      SET_SCALE_REQUESTED: (_, { payload }) => {
        return payload.scale;
      },
      RESET_WORKSPACE_REQUESTED: () => 1,
    },
    1,
  ),
  [KEY_SCALE_ORIGIN]: handleActions<typeof KEY_SCALE_ORIGIN>(
    {
      SET_SCALE_OFFSET_REQUESTED: (_, { payload }) => {
        return {
          top: Math.round(payload.top),
          left: Math.round(payload.left),
        };
      },
      RESET_WORKSPACE_REQUESTED: () => null,
    },
    null,
  ),
};

export default reducers;

export const getHighlightedStep = (state: StoreState) => state[KEY_HIGHLIGHTED_STEP];

export const getCanvasDimensions = (state: StoreState) => state[KEY_CANVAS_DIMENSIONS];

export const getActiveToolId = (state: StoreState) => state[KEY_CANVAS_TOOL_ID];

export const getState = (state: StoreState) => state;

export const getActiveTool = createSelector(
  getState,
  getActiveToolId,
  (state, id) => Tools[id](state),
);

export const getScale = (state: StoreState) => state[KEY_SCALE];
export const getScaleOrigin = (state: StoreState) => state[KEY_SCALE_ORIGIN];
