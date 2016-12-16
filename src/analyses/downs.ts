import common from 'analyses/common';

import {
  yAxis,
  downsAngleOfConvexity,
  downsABPlaneAngle,
  facialAngle,
} from 'analyses/landmarks/angles/skeletal';

const analysis: Analysis<'ceph_lateral'> = {
  id: 'downs',
  components: [
    ...common.components,
    {
      landmark: downsAngleOfConvexity,
      mean: 0,
      max: 5.1,
      min: -5.1,
    },
    {
      landmark: yAxis,
      mean: 59.4,
      max: 63.2,
      min: 55.6,
    },
    {
      landmark: downsABPlaneAngle,
      mean: -4.6,
      max: 4.6,
      min: -9.2,
    },
    {
      landmark: facialAngle,
      mean: 87.8,
      max: 91.4,
      min: 84.2,
    },
  ],
};

export default analysis;
