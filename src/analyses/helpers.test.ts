import { point, isCephPoint } from './helpers';

test('Create point with point()', () => {
  const N = point('N', 'Nasion');
  expect(N.symbol).toBe('N');
  expect(N.name).toBe('Nasion');
  expect(isCephPoint(N)).toBe(true);
});
