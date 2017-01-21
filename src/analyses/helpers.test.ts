import expect from 'expect';

import {
  point,
  line,
  isCephPoint,
  isCephLine,
  isStepManual,
  isStepAutomatic,
  defaultInterpetLandmark,
  angleBetweenPoints,
  getStepsForLandmarks,
} from './helpers';

import each from 'lodash/each';
import startCase from 'lodash/startCase';
import groupBy from 'lodash/groupBy';
import findIndex from 'lodash/findIndex';
import countBy from 'lodash/countBy';

describe('Analysis helpers', () => {
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
    describe('maps 3 ranges of values to 3 indications correctly', () => {
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
      const grouped = groupBy(expected, (([, indication]) => indication));
      describe('For each range, ', () => {
        each(grouped, (values, indication) => {
          describe(`${startCase(indication)}`, () => {
            it('sets correct category, indication and value', () => {
              each(values, ([value]) => {
                const [result] = interpet(value, 0, 4, 3);
                expect(result.category).toEqual('skeletalPattern');
                expect(result.indication).toEqual(indication);
                expect(result.value).toEqual(value);
              });
            });
          });
        });
      });
    });
  });

  describe('Get steps for landmarks', () => {
    let A: CephPoint;
    let B: CephPoint;
    let C: CephPoint;
    let AB: CephLine;
    let ABC: CephAngle;

    before(() => {
      A = point('A');
      B = point('B');
      C = point('C');
      AB = line(A, B);
      ABC = angleBetweenPoints(A, B, C);
    });

    it('should maintain the original steps order', () => {
      const steps = getStepsForLandmarks([A, B, C]);
      expect(steps).toMatch([A, B, C]);
    });

    it('should list subcomponents for compound landmarks', () => {
      const steps = getStepsForLandmarks([ABC]);
      expect(steps).toInclude(A);
      expect(steps).toInclude(B);
      expect(steps).toInclude(C);
    });

    it('should list any subcomponent before the main component', () => {
      const steps = getStepsForLandmarks([ABC]);
      const indexOfABC = findIndex(steps, ABC);
      expect(findIndex(steps, A)).toBeLessThan(indexOfABC);
      expect(findIndex(steps, B)).toBeLessThan(indexOfABC);
      expect(findIndex(steps, C)).toBeLessThan(indexOfABC);
    });

    it('should remove repeated steps (compared by symbol) regardless of removeEqualSteps param', () => {
      each([true, false], (value) => {
        const steps = getStepsForLandmarks([A, B, C, AB, ABC], value);
        expect(countBy(steps, A).true).toEqual(1);
        expect(countBy(steps, B).true).toEqual(1);
        expect(countBy(steps, C).true).toEqual(1);
      });
    });

    describe('Ignoring equal steps (compared by type of landmark)', () => {
      let BA: CephLine;
      let DAB: CephAngle;

      before(() => {
        BA = line(B, A);
        DAB = angleBetweenPoints(point('D'), A, B);
      });

      it('should respect the removeEqualSteps param', () => {
        const duplicated = getStepsForLandmarks([ABC, DAB], false);
        expect(duplicated)
          .toContain(AB)
          .toContain(BA);

        const deduplicated = getStepsForLandmarks([ABC, DAB], true);
        expect(duplicated.length).toBeMoreThan(deduplicated.length);
        expect(deduplicated)
          .toContain(BA)
          .toNotContain(AB);
      });

      it('should not remove a duplicated step if it is an explicit step', () => {
        expect(getStepsForLandmarks([ABC, DAB], true))
          .toNotContain(AB);

        expect(getStepsForLandmarks([AB, ABC, DAB], true))
          .toContain(AB);
      });

      it('prefers an explicitly specified step over an implicit one when deduplicating', () => {
        expect(getStepsForLandmarks([ABC, DAB], true)).toContain(BA);
        expect(getStepsForLandmarks([AB, ABC, DAB], true)).toNotContain(BA);
      });
    });
  });
});
