import expect from 'expect';

import basic from './basic';
import { mapAndCalculateSteps, getStepsForAnalysis, indexAnalysisResults } from 'analyses/helpers';

import each from 'lodash/each';

const class2 = {
  N: {
    x: 1377,
    y: 473,
  },
  S: {
    x: 623,
    y: 661,
  },
  A: {
    x: 1365,
    y: 1147,
  },
  B: {
    x: 1231,
    y: 1654,
  },
};

const verticalGrowth = {
  N: {
    x: 1377,
    y: 473,
  },
  S: {
    x: 623,
    y: 661,
  },
  Ar: {
    x: 494,
    y: 955,
  },
  Go: {
    x: 569,
    y: 1403,
  },
  Me: {
    x: 1130,
    y: 1855,
  },
};

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

  const steps = getStepsForAnalysis(basic, false);
  const { values, objects } = mapAndCalculateSteps(steps, manualLandmarks);

  it('should be calculated correctly', () => {
    describe('every component is mapped or calculated', () => {
      each(steps, ({ symbol }) => {
        it (`${symbol} is mapped or calculated`, () => {
          expect(objects[symbol] || values[symbol]).toExist();
        });
      });
    });

    describe('calculated values are correct', () => {
      const expected = {
        'ANB': 6,
        'SNA': 74,
        'SNB': 68,
        'Björk': 412,
        'MM': 43,
        'Y-FH Angle': 63,
        'NAPog': 11,
        'FMPA': 38,
      };

      each(expected, (value, symbol: string) => {
        it(`${symbol} value is correct`, () => {
          expect(value).toEqual(Math.floor(values[symbol]!));
        });
      });
    });
  });

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

  describe('should be interpreted correctly', () => {
    it('every indication is correct', () => {
      const results = basic.interpret(values, objects);
      const actual = indexAnalysisResults(results);
      expect(actual).toMatch(expected);
    });
  });
});
