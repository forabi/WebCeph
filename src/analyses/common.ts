import { SNA, SNB, ANB, FMPA, SN_MP } from 'analyses/landmarks/angles/skeletal';

const analysis: Analysis<'ceph_lateral'> = {
  id: 'common',
  components: [
    {
      landmark: SNA,
      mean: 82,
      max: 84,
      min: 80,
    },
    {
      landmark: SNB,
      mean: 80,
      max: 82,
      min: 78,
    },
    {
      landmark: ANB,
      mean: 2,
      max: 4,
      min: 0,
    },
    {
      landmark: FMPA,
      mean: 21.9,
      max: 26.9,
      min: 16.9,
    },
    {
      landmark: SN_MP,
      mean: 35,
      max: 40,
      min: 30,
    },
  ],
};

export default analysis;
