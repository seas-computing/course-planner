import { strictEqual } from 'assert';
import { camelCaseToTitleCase, toTitleCase } from '../util';

describe('Util Helper Functions', function () {
  describe('camelCaseToTitleCase', function () {
    it('should convert a camel case string to title case', function () {
      const camelCaseString = 'termPattern';
      strictEqual(camelCaseToTitleCase(camelCaseString), 'Term Pattern');
    });
  });
  describe('toTitleCase', function () {
    it('converts lower case to title case', function () {
      const lowerCaseString = 'alllowercase';

      strictEqual(toTitleCase(lowerCaseString), 'Alllowercase');
    });
    it('converts upper case to title case', function () {
      const upperCaseString = 'ALLUPPERCASE';

      strictEqual(toTitleCase(upperCaseString), 'Alluppercase');
    });
    it('converts mixed case to title case', function () {
      const mixedCaseString = 'mIxEdCase';

      strictEqual(toTitleCase(mixedCaseString), 'Mixedcase');
    });
  });
});
