import { strictEqual } from 'assert';
import { parseCatalogNumberForPrefixNumber } from '../courseHelperFunctions';

describe('Course Helper Functions', function () {
  describe('parseCatalogNumberForPrefixNumber', function () {
    context('when a valid catalog number is supplied', function () {
      it('should return an object with the prefix and course number', function () {
        const coursePrefix = 'BE';
        const courseNumber = '310a';
        const validCatalogNumber = `${coursePrefix} ${courseNumber}`;
        const result = parseCatalogNumberForPrefixNumber(validCatalogNumber);
        strictEqual(result.prefix, coursePrefix);
        strictEqual(result.number, courseNumber);
      });
    });
    context('when a catalog number with no space in between the prefix and number is supplied', function () {
      it('should return an object with the prefix and course number', function () {
        const coursePrefix = 'AM';
        const courseNumber = '202';
        const validCatalogNumber = `${coursePrefix}${courseNumber}`;
        const result = parseCatalogNumberForPrefixNumber(validCatalogNumber);
        strictEqual(result.prefix, coursePrefix);
        strictEqual(result.number, courseNumber);
      });
    });
    context('when the course prefix is missing from the catalog number supplied', function () {
      it('should return an object with the course number but no prefix', function () {
        const coursePrefix = '';
        const courseNumber = '100';
        const invalidCatalogNumber = `${coursePrefix} ${courseNumber}`;
        const result = parseCatalogNumberForPrefixNumber(invalidCatalogNumber);
        strictEqual(result.prefix, '');
        strictEqual(result.number, courseNumber);
      });
    });
    context('when the course number is missing from the catalog number supplied', function () {
      it('should return an object with the course prefix but no course number', function () {
        const coursePrefix = 'EE';
        const courseNumber = '';
        const invalidCatalogNumber = `${coursePrefix} ${courseNumber}`;
        const result = parseCatalogNumberForPrefixNumber(invalidCatalogNumber);
        strictEqual(result.prefix, coursePrefix);
        strictEqual(result.number, '');
      });
    });
  });
});
