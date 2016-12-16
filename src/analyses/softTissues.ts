import { Z } from 'analyses/landmarks/angles/soft';
import { upperLipToELine, lowerLipToELine } from 'analyses/landmarks/distances/soft';

import { defaultInterpretAnalysis } from 'analyses/helpers';

const components: AnalysisComponent[] = [
  {
    landmark: upperLipToELine,
    mean: -2,
    max: 0,
    min: -3,
  },
  {
    landmark: lowerLipToELine,
    mean: -2,
    max: 0,
    min: -3,
  },
  {
    landmark: Z,
    mean: 80,
    max: 89,
    min: 71,
  },
];

const analysis: Analysis<'ceph_lateral'> = {
  id: 'soft_tissues_lateral',
  components,
  interpret: defaultInterpretAnalysis(components),
};

export default analysis;
