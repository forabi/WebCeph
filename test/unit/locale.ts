import expect from 'expect';
import each from 'lodash/each';

import { negotiateLanguageOrLocale } from 'utils/locale';

describe('Language negotiation', () => {
  it('Negotiates for preferred language correctly', () => {
    const tests = [
      {
        supported: ['en-US', 'ar-SY'],
        preferred: ['ar'],
        expected: 'ar-SY',
      },
      {
        supported: ['ar'],
        preferred: ['ar-SY'],
        expected: 'ar',
      },
      {
        supported: ['ar-SY'],
        preferred: ['ar'],
        expected: 'ar-SY',
      },
      {
        supported: ['en'],
        preferred: ['ar'],
        expected: 'en',
      },
      {
        supported: ['en', 'ar', 'ar-SY'],
        preferred: ['ar-SY'],
        expected: 'ar-SY',
      },
      {
        supported: ['en-US', 'ar'],
        preferred: ['ar', 'en-US'],
        expected: 'ar',
      },
      {
        supported: ['en-US', 'en-GB', 'ar'],
        preferred: ['en', 'ar'],
        expected: 'en-US',
      },
      {
        supported: ['en', 'en-GB', 'ar'],
        preferred: ['en-US', 'ar'],
        expected: 'en',
      },
      {
        supported: ['en', 'en-US'],
        preferred: ['en-US', 'en'],
        expected: 'en-US',
      },
      {
        supported: ['en', 'en-US'],
        preferred: ['en-US', 'en'],
        expected: 'en',
      },
    ];

    each(tests, ({ expected, preferred, supported }) => {
      const actual = negotiateLanguageOrLocale(supported, preferred, true);
      expect(actual).toMatch(expected);
      expect(supported).toInclude(actual);
    });
  });
});
