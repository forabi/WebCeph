import { handleActions } from 'utils/store';

const KEY_SUPERIMPOSITION_MODE: StoreKey = 'workspace.superimposition.mode';
const KEY_SUPERIMPOSITION_IMAGE_IDS: StoreKey = 'workspace.superimposition.imageIds';

const reducers: Partial<ReducerMap> = {
  [KEY_SUPERIMPOSITION_MODE]: handleActions<typeof KEY_SUPERIMPOSITION_MODE>({
    SET_SUPERIMPOSITION_MODE_REQUESTED: (_, { payload: { mode } }) => mode,
  }, 'auto'),
  [KEY_SUPERIMPOSITION_IMAGE_IDS]: handleActions<typeof KEY_SUPERIMPOSITION_IMAGE_IDS>({
    SUPERIMPOSE_IMAGES_REQUESTED: (_, { payload: { imageIds } }) => imageIds,
  }, []),
};

export default reducers;

export const getSuperimpsotionMode = (state: StoreState) => state[KEY_SUPERIMPOSITION_MODE];
export const getSuperimposedImages = (state: StoreState) => state[KEY_SUPERIMPOSITION_IMAGE_IDS];
