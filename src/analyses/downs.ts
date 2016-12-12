import common from 'analyses/common';

import {
  yAxis,
  downsAngleOfConvexity,
  downsABPlaneAngle,
  facialAngle,
} from 'analyses/landmarks/angles/skeletal';

const components: AnalysisComponent[] = [
  ...common.components,
  {
    landmark: downsAngleOfConvexity,
    norm: 0,
    stdDev: 5.1,
  },
  {
    landmark: yAxis,
    norm: 59.4,
    stdDev: 3.8,
  },
  {
    landmark: downsABPlaneAngle,
    norm: -4.6,
    stdDev: 4.6,
  },
  {
    landmark: facialAngle,
    norm: 87.8,
    stdDev: 3.6,
  },
];

const analysis: Analysis = {
  id: 'downs',
  components,
};

export default analysis;
