import bjork from 'analyses/bjork';
import common from 'analyses/common';
import { MM, downsAngleOfConvexity, yAxis } from 'analyses/landmarks/angles/skeletal';

import dental from 'analyses/dental';

import { defaultInterpretAnalysis } from 'analyses/helpers';

const components: AnalysisComponent[] = [
  ...common.components,
  {
    landmark: downsAngleOfConvexity,
    mean: 0,
    max: 5,
    min: -5,
  },
  {
    landmark: yAxis,
    mean: 59,
    max: 57,
    min: 60.1,
  },
  {
    landmark: MM,
    mean: 26,
    max: 30,
    min: 22,
  },
  ...bjork.components,
  ...dental.components,
];

const analysis: Analysis<'ceph_lateral'> = {
  id: 'basic',
  components,
  interpret: defaultInterpretAnalysis(components),
};

export default analysis;
