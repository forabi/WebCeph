import { ANB } from './skeletal';

test('ANB interpretation', () => {
  const [class1] = ANB.interpret!(3, 0, 4, 2);
  expect(class1.category).toBe('skeletalPattern');
  expect(class1.indication).toBe('class1');

  const [class2] = ANB.interpret!(5, 0, 4, 2);
  expect(class2.category).toBe('skeletalPattern');
  expect(class2.indication).toBe('class2');

  const [class3Tendency] = ANB.interpret!(1, 0, 4, 2);
  expect(class3Tendency.category).toBe('skeletalPattern');
  expect(class3Tendency.indication).toBe('tendency_for_class3');

  const [class3] = ANB.interpret!(-2, 0, 4, 2);
  expect(class3.category).toBe('skeletalPattern');
  expect(class3.indication).toBe('class3');
});
