import expect from 'expect';

import {
  point,
  line,
  isCephPoint,
  isCephLine,
  isStepManual,
  isStepAutomatic,
  defaultInterpetLandmark,
} from './helpers';

import each from 'lodash/each';

describe('Create point with point()', () => {
  const N = point('N', 'Nasion');
  it('sets the name and symbol correctly', () => {
    expect(N.symbol).toBe('N');
    expect(N.name).toBe('Nasion');
  });
  it('is a valid CephPoint', () => {
    expect(isCephPoint(N)).toBe(true);
  });
  it('has no sub-components', () => {
    expect(N.components.length).toBe(0);
  });
  it('is a manual step', () => {
    expect(isStepManual(N)).toBe(true);
    expect(N.map).toNotExist();
  });
  it('sets the image type to lateral cephalometric by default', () => {
    expect(N.imageType).toBe('ceph_lateral');
  });
});

describe('Create line with line()', () => {
  const testLine = (line: CephLine) => {
    it('is a valid CephLine', () => {
      expect(isCephLine(line)).toBe(true);
    });
    it('has point sub-components', () => {
      expect(line.components.length).toBe(2);
      each(line.components, (component) => {
        expect(isCephPoint(component)).toBe(true);
      });
    });
    it('is an automatic step', () => {
      expect(isStepAutomatic(line)).toBe(true);
      expect(line.map).toExist();
    });
    it('sets the image type to lateral cephalometric by default', () => {
      expect(line.imageType).toBe('ceph_lateral');
    });
  };

  describe('With a custom symbol', () => {
    const FH = line(point('Or'), point('Po'), 'Frankfort Horizontal Plane', 'FH');
    it('sets the name and symbol correctly', () => {
      expect(FH.symbol).toBe('FH');
      expect(FH.name).toBe('Frankfort Horizontal Plane');
    });
    testLine(FH);
  });

  describe('Without a custom symbol', () => {
    const FH = line(point('Or'), point('Po'), 'Frankfort Horizontal Plane');
    it('sets the symbol correctly', () => {
      expect(FH.symbol).toBe('Or-Po');
      expect(FH.name).toBe('Frankfort Horizontal Plane');
    });
    testLine(FH);
  });
});


describe('Default landmark intepretation', () => {
  it('maps 3 ranges of values to 3 indications correclty', () => {
    const interpet = defaultInterpetLandmark('skeletalPattern', ['class3', 'class1', 'class2']);
    const expected: Array<[number, Indication<'skeletalPattern'>]> = [
      [-3, 'class3'],
      [-2, 'class3'],
      [-1, 'class3'],
      [ 0, 'class1'],
      [ 1, 'class1'],
      [ 2, 'class1'],
      [ 3, 'class1'],
      [ 4, 'class1'],
      [ 5, 'class2'],
    ];
    it('For each range, ', () => {
      each(expected, ([value, indication]) => {
       it(`${indication}`, () => {
          const [result] = interpet(value, 0, 4, 3);
          it('sets correct category', () => {
            expect(result.category).toBe('skeletalPattern');
          });
          it('sets correct indication', () => {
            expect(result.indication).toBe(indication);
          });
          it('sets correct value', () => {
            expect(result.value).toEqual(value);
          });
       });
      });
    });
  });
});
