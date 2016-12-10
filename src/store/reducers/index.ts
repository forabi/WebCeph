import env from './env';
import workspace from './workspace';

const reducers: ReducerMap = {
  ...workspace,
  ...env,
};

export default reducers;
