import assign from 'lodash/assign';
import env from './env';
import workspace from './workspace';

const reducers = assign(
  { },
  workspace,
  env,
);

export const canUndo = ({ past }: EnhancedState<GenericState>) => past.length > 0;
export const canRedo = ({ future }: EnhancedState<GenericState>) => future.length > 0;

export default reducers;
