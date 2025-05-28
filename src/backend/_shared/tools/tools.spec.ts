import { detectType, detectTypeFromString, replaceAll } from './tools';
describe('check types', () => {
  describe('detectTypeFromString', () => {
    it('detect boolean', () => {
      expect(detectTypeFromString('true')).toEqual('boolean')
      expect(detectTypeFromString('false')).toEqual('boolean')
      expect(detectTypeFromString('TrUE')).toEqual('boolean')
      expect(detectTypeFromString('False ')).toEqual('boolean')
    });
    it('detect string', () => {
      expect(detectTypeFromString('Das ist ein String ')).toEqual('string')
      expect(detectTypeFromString('Das ist ein false positive ')).toEqual('string')
    });
    it('check integer', () => {
      expect(detectTypeFromString('3.x')).toEqual('string');
      expect(detectTypeFromString('3')).toEqual('number');
      expect(detectTypeFromString('3.3')).toEqual('number');
      expect(detectTypeFromString('I haxve 3.3 horses')).toEqual('string'); // false positive
    })
  });
  describe('detectType', () => {
    it('detects primitives', () => {
      expect(detectType(3.2)).toEqual('number');
      expect(detectType(3)).toEqual('number');
      expect(detectType(true)).toEqual('boolean');
      expect(detectType('true')).toEqual('string');
    });
    it('detects object', () => {
      expect(detectType({})).toEqual('object');
      expect(detectType({ xx: 'foo', yy: 3, zz: true})).toEqual('object');
    });
    it('detects array', () => {
      expect(detectType([])).toEqual('array');
    });
  });
});

describe('check replaceAll', () => {
    it('replace detected items', () => {
        const input = 'Das ist ein doppeltes ist hier.';
        const output = 'Das dort ein doppeltes dort hier.';
        expect(replaceAll(input, 'ist', 'dort')).toEqual(output);
    });
});