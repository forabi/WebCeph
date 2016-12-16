import { U1_SN, L1_MP, interincisalAngle } from 'analyses/landmarks/angles/skeletal';

const analysis: Analysis<'ceph_lateral'> = {
  id: 'basic',
  components: [
    {
      landmark: interincisalAngle,
      mean: 130,
      max: 135,
      min: 125,
    },
    {
      landmark: U1_SN,
      mean: 102,
      max: 107,
      min: 97,
    },
    {
      landmark: L1_MP,
      mean: 90,
      min: 87,
      max: 93,
    },
  ],
};

export default analysis;
