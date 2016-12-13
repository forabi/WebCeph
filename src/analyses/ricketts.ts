import {
  facialAngle,
  FMPA,
  L1ToDentalPlaneAngle,
  lowerFacialHeightAngle,
} from 'analyses/landmarks/angles/skeletal';
import {
  convexityAtPointA,
  mandibularIncisorToDentalPlane,
} from 'analyses/landmarks/distances/skeletal';

import { upperLipToELine, lowerLipToELine } from 'analyses/landmarks/distances/soft';

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
    {
      landmark: L1ToDentalPlaneAngle,
      mean: 22,
      max: 24,
      min: 20,
    },
    {
      landmark: lowerFacialHeightAngle,
      mean: 45,
      max: 45,
      min: 45,
    },
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
  ],
};

export default analysis;
