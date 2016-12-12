import bjork from 'analyses/bjork';
import common from 'analyses/common';
import { MM, downsAngleOfConvexity, yAxis } from 'analyses/landmarks/angles/skeletal';
import dental from 'analyses/dental';

const analysis: Analysis = {
  id: 'basic',
  components: [
    ...common.components,
    {
      landmark: downsAngleOfConvexity,
      norm: 0,
      stdDev: 5,
    },
    {
      landmark: yAxis,
      norm: 59,
      stdDev: 3,
    },
    {
      landmark: MM,
      norm: 26,
      stdDev: 4,
    },
    ...bjork.components,
    ...dental.components,
  ],
};

export default analysis;
