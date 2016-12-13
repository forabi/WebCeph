import { facialAngle, FMPA } from 'analyses/landmarks/angles/skeletal';
import {
  convexityAtPointA,
  mandibularIncisorToDentalPlane,
} from 'analyses/landmarks/distances/skeletal';

const analysis: Analysis = {
  id: 'ricketts',
  components: [
    {
      landmark: facialAngle,
      mean: 87,
      max: 90,
      min: 84,
    },
    {
      landmark: FMPA,
      mean: 24,
      max: 26,
      min: 21,
    },
    {
      landmark: convexityAtPointA,
      max: 4,
      mean: 2,
      min: 0,
    },
    {
      landmark: mandibularIncisorToDentalPlane,
      mean: 1,
      max: 3,
      min: -1,
    },

  ],
};

export default analysis;
