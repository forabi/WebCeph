const redoType: ActionType = 'REDO_REQUESTED';
const undoType: ActionType = 'UNDO_REQUESTED';

const undoableConfig = {
  undoType,
  redoType,
  limit: 100,
};

export const DEMO_IMAGE_URL =
  'https://upload.wikimedia.org/wikipedia/commons/6/66/Cephalometric_radiograph.JPG';

export { undoableConfig };
