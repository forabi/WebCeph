import { point, line, getSymbolForAngle } from './helpers';
import * as assert from 'assert';

describe('point()', () => {

});

describe('line()', () => {
    
});

describe('angleBetweenLines()', () => {
    
});

describe('angleBetweenPoints()', () => {
    
});

describe('getSymbolForAngle()', () => {
    it('should get the correct symbol for an angle', () => {
        const A = point('A');
        const B = point('B');
        const C = point('C');
        const lineA = line(A, B);
        const lineB = line(B, C);
        const symbol = getSymbolForAngle(lineA, lineB);
        assert.equal(symbol, 'ABC');
    });

    it('should handle unconnected lines');
    it('should handle points whith symbols longer than 1 character');
});

describe('calculate()', () => {
    it('should handle angular measurements');
    it('should handle linear measurements with scale factor');
    it('custom calculate methods should have precedence over other default ones');
});