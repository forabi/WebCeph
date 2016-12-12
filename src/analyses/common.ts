import { SNA, SNB, ANB, FMPA, SN_MP } from 'analyses/landmarks/angles/skeletal';

const analysis: Analysis = {
  id: 'common',
  components: [
    {
      landmark: SNA,
      norm: 82,
      stdDev: 2,
    },
    {
      landmark: SNB,
      norm: 80,
      stdDev: 2,
    },
    {
      landmark: ANB,
      norm: 2,
      stdDev: 2,
    },
    {
      landmark: FMPA,
      norm: 21.9,
      stdDev: 5,
    },
    {
      landmark: SN_MP,
      norm: 35,
      stdDev: 5,
    },
  ],
};

export default analysis;
