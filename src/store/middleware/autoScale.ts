import { Event } from 'utils/constants';
import { Store, Dispatch, Middleware } from 'redux';

import {
  setScale,
} from 'actions/workspace';

import {
  getCanvasSize,
} from 'store/reducers/workspace/canvas';

const middleware: Middleware = ({ getState, dispatch }: Store<any>) =>
  (next: Dispatch<any>) => async (action: Action<any>) => {
    const { type } = action;
    if (type === Event.LOAD_IMAGE_SUCCEEDED) {
      const { height, width }: Payloads.imageLoadSucceeded = action.payload;
      try {
        const {
          width: canvasWidth,
          height: canvasHeight,
        } = getCanvasSize(getState());
        const scale = 1 / Math.max(
          height / canvasHeight,
          width / canvasWidth,
        );
        dispatch(setScale(scale));
        next(action);
      } catch (e) {
        console.error(
          `Failed to set scale automatically.`,
          e,
        );
      }
    } else {
      next(action);
    }
  };

export default middleware;
