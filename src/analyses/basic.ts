import { components as commonComponents } from './common';
import { angleOfConvexity, interpret as interpretDowns } from './downs';

const analysis: Analysis = {
  id: 'basic',
  components: [
    ...commonComponents,
    angleOfConvexity,
  ],
  interpret(values) {
    return [
      ...interpretDowns(values),
    ]
  }
}

export default analysis;