import { Event } from 'utils/constants';

const undoableConfig = {
  undoType: Event.UNDO_REQUESTED,
  redoType: Event.REDO_REQUESTED,
  limit: 100,
};

export { undoableConfig };
