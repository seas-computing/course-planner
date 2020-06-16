import { strictEqual } from 'assert';
import OFFERED, { offeredEnumToString } from '../offered';

describe('offeredEnumToString', function () {
  context('OFFERED.Y', function () {
    it('Should return "Yes"', function () {
      strictEqual(offeredEnumToString(OFFERED.Y), 'Yes');
    });
  });
  context('OFFERED.N', function () {
    it('Should return "No"', function () {
      strictEqual(offeredEnumToString(OFFERED.N), 'No');
    });
  });
  context('OFFERED.BLANK', function () {
    it('Should return ""', function () {
      strictEqual(offeredEnumToString(OFFERED.BLANK), '');
    });
  });
  context('OFFERED.RETIRED', function () {
    it('Should return "Retired"', function () {
      strictEqual(offeredEnumToString(OFFERED.RETIRED), 'Retired');
    });
  });
  context('Any other value', function () {
    it('should return null', function () {
      strictEqual(offeredEnumToString('foo' as OFFERED), null);
    });
  });
});
