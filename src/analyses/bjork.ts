import { bjorkSum } from 'analyses/landmarks/other/skeletal';

import { defaultInterpretAnalysis } from 'analyses/helpers';

const components: AnalysisComponent[] = [
  {
    landmark: bjorkSum,
    max: 406,
    mean: 396,
    min: 390,
  },
];

const analysis: Analysis<'ceph_lateral'> = {
  id: 'bjork',
  components,
  interpret: defaultInterpretAnalysis(components),
};

export default analysis;
