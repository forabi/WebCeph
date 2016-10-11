import { components as commonComponents } from './common';
import { angleOfConvexity, angleOfYAxis, interpret as interpretDowns } from './downs';
import bjork from './bjork';

const analysis: Analysis = {
  id: 'basic',
  components: [
    ...commonComponents,
    angleOfConvexity,
    angleOfYAxis,
    ...bjork.components,
  ],
  interpret(values) {
    return [
      ...interpretDowns(values),
      ...bjork.interpret(values),
    ]
  }
}

export default analysis;