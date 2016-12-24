import { Store, Middleware } from 'redux';

import {
  setScale,
} from 'actions/workspace';

import {
  getCanvasDimensions,
} from 'store/reducers/workspace/canvas';

import { isActionOfType } from 'utils/store';

const middleware: Middleware = ({ getState, dispatch }: Store<StoreState>) =>
  (next: GenericDispatch) => async (action: GenericAction) => {
    if (!isActionOfType(action, 'LOAD_IMAGE_SUCCEEDED')) {
      return next(action);
    } else {
      const { id: imageId, height, width } = action.payload;
      try {
        const {
          width: canvasWidth,
          height: canvasHeight,
        } = getCanvasDimensions(getState());
        const scale = 1 / Math.max(
          height / canvasHeight,
          width / canvasWidth,
        );
        dispatch(setScale({ imageId, scale }));
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
