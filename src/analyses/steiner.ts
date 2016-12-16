import { defaultInterpretAnalysis } from 'analyses/helpers';

const components: AnalysisComponent[] = [
  
];

const analysis: Analysis<'ceph_lateral'> = {
  id: 'steiner',
  components,
  interpret: defaultInterpretAnalysis(components),
};

export default analysis;
