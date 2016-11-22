import compatibility from './compatibility';
import init from './init';
import offline from './offline';

import assign from 'lodash/assign';

export default assign(
  { },
  init,
  compatibility,
  offline,
);
