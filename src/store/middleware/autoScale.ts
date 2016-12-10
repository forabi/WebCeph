import { Event } from 'utils/constants';
import { Store, Middleware } from 'redux';

import {
  setScale,
} from 'actions/workspace';

import {
  getCanvasSize,
} from 'store/reducers/workspace/canvas';

const middleware: Middleware = ({ getState, dispatch }: Store<any>) =>
  (next: GenericDispatch) => async (action: Action<any>) => {
    const { type } = action;
    if (type !== Event.LOAD_IMAGE_SUCCEEDED) {
      return next(action);
    } else {
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
        return next(action);
      } catch (e) {
        console.error(
          `Failed to set scale automatically.`,
          e,
        );
      }
    }
  };

export default middleware;
