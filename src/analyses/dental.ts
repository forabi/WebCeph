import { U1_SN, L1_MP, interincisalAngle } from 'analyses/landmarks/angles/skeletal';

const analysis: Analysis = {
  id: 'basic',
  components: [
    {
      landmark: interincisalAngle,
      norm: 130,
      stdDev: 5,
    },
    {
      landmark: U1_SN,
      norm: 102,
      stdDev: 5,
    },
    {
      landmark: L1_MP,
      norm: 90,
      stdDev: 3,
    },
  ],
};

export default analysis;
