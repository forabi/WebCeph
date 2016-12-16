import { bjorkSum } from 'analyses/landmarks/other/skeletal';

import { defaultInterpretAnalysis } from 'analyses/helpers';

const components: AnalysisComponent[] = [
  {
    landmark: bjorkSum,
    mean: 396,
    max: 412,
    min: 390,
  },
];

const analysis: Analysis<'ceph_lateral'> = {
  id: 'bjork',
  components,
  interpret: defaultInterpretAnalysis(components),
};

export default analysis;
