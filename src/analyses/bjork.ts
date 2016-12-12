import { bjorkSum } from 'analyses/landmarks/other/skeletal';

const analysis: Analysis = {
  id: 'bjork',
  components: [
    {
      landmark: bjorkSum,
      norm: 396,
      stdDev: 6,
    },
  ],
};

export default analysis;
