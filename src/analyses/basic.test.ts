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
      x: 435.4473753290737,
      y: 825.2509090909091,
    },
    'Or': {
      x: 1235.5637708904085,
      y: 833.6290909090909,
    },
    'Pog': {
      x: 1222.9964976616964,
      y: 1780.3636363636363,
    },
    'Gn': {
      x: 1193.672860128035,
      y: 1855.7672727272727,
    },
    'PNS': {
      x: 892.0583026389453,
      y: 1093.3527272727272,
    },
    'ANS': {
      x: 1377.9928674824785,
      y: 1055.650909090909,
    },
    'U1 Incisal Edge': {
      x: 1382.181958558716,
      y: 1386.5890909090908,
    },
    'U1 Apex': {
      x: 1302.589228110206,
      y: 1147.810909090909,
    },
    'L1 Incisal Edge': {
      x: 1336.101956720105,
      y: 1403.3454545454545,
    },
    'L1 Apex': {
      x: 1189.4837690517975,
      y: 1633.7454545454545,
    },
  };

  const steps = getStepsForAnalysis(basic, false);
  const { values, objects } = mapAndCalculateSteps(steps, manualLandmarks);

  it('should be calculated correctly', () => {
    describe('every component is mapped or calculated', () => {
      for (const { symbol } of steps) {
        it (`${symbol} is mapped or calculated`, () => {
          expect(objects[symbol] || values[symbol]).toExist();
        });
      }
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

  describe('should be interpreted correctly', () => {
    it('every indication is correct', () => {
      const results = basic.interpret(values, objects);
      const grouped = indexAnalysisResults(results);
      expect(grouped.skeletalPattern).toExist();
      expect(grouped.skeletalPattern!.indication).toEqual('class2');
      expect(grouped.skeletalPattern!.relevantComponents[0].symbol).toBe('ANB');
      expect(grouped.growthPattern).toExist();
      expect(grouped.growthPattern!.indication).toEqual('vertical');
      expect(grouped.growthPattern!.relevantComponents[0].symbol).toBe('Y-FH Angle');
      expect(grouped.growthPattern!.relevantComponents[1].symbol).toBe('Björk');
      expect(grouped.mandibularRotation).toExist();
      expect(grouped.mandibularRotation!.indication).toEqual('clockwise');
      expect(grouped.mandibularRotation!.relevantComponents[0].symbol).toBe('FMPA');
    });
  });
});
