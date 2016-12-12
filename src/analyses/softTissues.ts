import { Z } from 'analyses/landmarks/angles/soft';

const analysis: Analysis = {
  id: 'softTissues',
  components: [
    {
      landmark: Z,
      norm: 80,
      stdDev: 9,
    },
  ],
};

export default analysis;
