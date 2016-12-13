import { Z } from 'analyses/landmarks/angles/soft';
import { upperLipToELine, lowerLipToELine } from 'analyses/landmarks/distances/soft';

const analysis: Analysis = {
  id: 'softTissues',
  components: [
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
  ],
};

export default analysis;
