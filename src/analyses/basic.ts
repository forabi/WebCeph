import { components as commonComponents } from './common';
import { angleOfConvexity, angleOfYAxis, interpret as interpretDowns } from './downs';
import bjork from './bjork';
import dental from './dental';

const analysis: Analysis = {
  id: 'basic',
  components: [
    // ...commonComponents,
    // angleOfConvexity,
    // angleOfYAxis,
    // ...bjork.components,
    ...dental.components,
  ],
  interpret(values) {
    return [
      ...interpretDowns(values),
      ...bjork.interpret(values),
      ...dental.interpret(values),
    ];
  }
}

export default analysis;