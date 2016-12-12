import { bjorkSum } from 'analyses/landmarks/other/skeletal';

const analysis: Analysis = {
  id: 'bjork',
  components: [
    {
      landmark: bjorkSum,
      mean: 396,
      max: 412,
      min: 390,
    },
  ],
};

export default analysis;
