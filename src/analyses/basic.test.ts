import expect from 'expect';

import basic from './basic';
import { mapAndCalculateSteps, getStepsForAnalysis, indexAnalysisResults } from 'analyses/helpers';

describe('Basic Analysis', () => {
  const manualLandmarks = {
    'N': {
      x: 1377.9928674824785,
      y: 473.3672727272727,
    },
    'S': {
      x: 623.9564737597547,
      y: 661.8763636363636,
    },
    'A': {
      x: 1365.4255942537663,
      y: 1147.810909090909,
    },
    'B': {
      x: 1231.374679814171,
      y: 1654.690909090909,
    },
    'Po': {
      x: 435.4473753290737,
      y: 825.2509090909091,
    },
    'Or': {
      x: 1235.5637708904085,
      y: 833.6290909090909,
    },
    'Go': {
      x: 569.498289768669,
      y: 1403.3454545454545,
    },
    'Me': {
      x: 1130.8364939844746,
      y: 1855.7672727272727,
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
    'Ar': {
      x: 494.0946503963966,
      y: 955.1127272727272,
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

  const steps = getStepsForAnalysis(basic);
  const { values, objects } = mapAndCalculateSteps(steps, manualLandmarks);

  it('should be interpreted correctly', () => {
    const results = basic.interpret(values, objects);
    const grouped = indexAnalysisResults(results);
    expect(grouped.skeletalPattern).toExist();
    expect(grouped.skeletalPattern!.indication === 'tendency_for_class3');
    expect(grouped.growthPattern).toExist();
    expect(grouped.growthPattern!.indication === 'vertical');
    expect(grouped.mandibularRotation).toExist();
    expect(grouped.mandibularRotation!.indication === 'clockwise');
  });
});
