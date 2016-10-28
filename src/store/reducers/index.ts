import assign from 'lodash/assign';
import env from './env';
import workspace from './workspace';

const reducers = assign(
  { },
  workspace,
  env,
);

export default reducers;
