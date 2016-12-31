import expect from 'expect';

import { mapAndCalculateSteps, getStepsForAnalysis, indexAnalysisResults } from 'analyses/helpers';

import keyBy from 'lodash/keyBy';
import each from 'lodash/each';

export function testAnalysis(
  analysis: Analysis<ImageType>,
  manualLandmarks: Record<string, GeoObject>,
  expected: Array<CategorizedAnalysisResult<Category>>,
) {
  const steps = getStepsForAnalysis(analysis, false);
  const { values, objects } = mapAndCalculateSteps(steps, manualLandmarks);

  it('should be calculated and mapped correctly', () => {
    each(steps, ({ symbol }) => {
      it (`${symbol} is mapped or calculated`, () => {
        expect(objects[symbol] || values[symbol]).toExist();
      });
    });
  });

  describe('should be interpreted correctly', () => {
    const results = analysis.interpret(values, objects);
    const actual = indexAnalysisResults(results);
    each(expected, (result) => {
      const { category } = result;
      describe(`provides interpretation for ${category}`, () => {
        expect(actual[category]).toExist();
        it(`indication for ${category} is correct`, () => {
          expect(actual[category]!.indication).toMatch(result!.indication);
        });
        describe(`relevant components are listed in ${category}`, () => {
          const expectedSymbols = keyBy(result.relevantComponents, c => c.symbol);
          const actualSymbols = keyBy(actual[category]!.relevantComponents, c => c.symbol);
          each(expectedSymbols, ({ value }, symbol) => {
            it(`${symbol} is listed as a relevant component for ${category}`, () => {
              expect(actualSymbols[symbol!]).toExist();
            });
            it(`${symbol} has the same value as the input`, () => {
              expect(Math.floor(actualSymbols[symbol!].value)).toEqual(value);
            });
          });
        });
      });
    });
  });
};

export const class2 = {
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

export const verticalGrowth = {
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


