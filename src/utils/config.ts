import { Event } from 'utils/constants';

const undoableConfig = {
  undoType: Event.UNDO_REQUESTED,
  redoType: Event.REDO_REQUESTED,
  limit: 100,
};

export const DEMO_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/6/66/Cephalometric_radiograph.JPG';

export { undoableConfig };
