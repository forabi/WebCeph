import basic from './basic';
import { testAnalysis, class2, verticalGrowth } from 'utils/tests';

describe('Basic Analysis', () => {
  const manualLandmarks = {
    ...class2,
    ...verticalGrowth,
    'Po': {
      x: 435,
      y: 825,
    },
    'Or': {
      x: 1235,
      y: 833,
    },
    'Pog': {
      x: 1222,
      y: 1780,
    },
    'Gn': {
      x: 1193,
      y: 1855,
    },
    'PNS': {
      x: 892,
      y: 1093,
    },
    'ANS': {
      x: 1377,
      y: 1055,
    },
    'U1 Incisal Edge': {
      x: 1382,
      y: 1386,
    },
    'U1 Apex': {
      x: 1302,
      y: 1147,
    },
    'L1 Incisal Edge': {
      x: 1336,
      y: 1403,
    },
    'L1 Apex': {
      x: 1189,
      y: 1633,
    },
  };
  const expected: IndexedAnalysisInterpretation = {
    skeletalPattern: {
      category: 'skeletalPattern',
      indication: 'class2',
      relevantComponents: [
        {
          symbol: 'ANB',
          value: 74,
          min: 0,
          mean: 2,
          max: 4,
        },
      ],
      severity: 'none',
    },
    growthPattern: {
      category: 'growthPattern',
      indication: 'vertical',
      relevantComponents: [
        {
          symbol: 'Y-FH Angle',
          value: 63,
          min: 57,
          mean: 59,
          max: 60.1,
        },
        {
          symbol: 'Björk',
          value: 412,
          min: 390,
          mean: 396,
          max: 406,
        },
      ],
    },
    mandibularRotation: {
      category: 'mandibularRotation',
      indication: 'clockwise',
      severity: 'none',
      relevantComponents: [
        {
          symbol: 'FMPA',
          value: 38,
          min: 16.9,
          mean: 21.9,
          max: 26.9,
        },
      ],
    },
  };
  testAnalysis(basic, manualLandmarks, expected);
});
