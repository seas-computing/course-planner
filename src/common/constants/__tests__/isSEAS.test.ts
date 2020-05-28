import { strictEqual } from 'assert';
import IS_SEAS, { isSEASEnumToString } from '../isSEAS';

describe('isSEASEnumToString', function () {
  context('IS_SEAS.Y', function () {
    it('Should return "Yes"', function () {
      strictEqual(isSEASEnumToString(IS_SEAS.Y), 'Yes');
    });
  });
  context('IS_SEAS.N', function () {
    it('Should return "No"', function () {
      strictEqual(isSEASEnumToString(IS_SEAS.N), 'No');
    });
  });
  context('IS_SEAS.EPS', function () {
    it('Should return "EPS"', function () {
      strictEqual(isSEASEnumToString(IS_SEAS.EPS), 'EPS');
    });
  });
  context('Any other value', function () {
    it('should return null', function () {
      strictEqual(isSEASEnumToString('foo' as IS_SEAS), null);
    });
  });
});
