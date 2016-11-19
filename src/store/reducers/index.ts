import env from './env';
import workspace from './workspace';

const reducers = {
  ...workspace,
  ...env,
};

export default reducers;
