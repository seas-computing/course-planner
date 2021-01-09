import { strictEqual } from 'assert';
import { camelCaseToTitleCase } from '../util';

describe('Util Helper Functions', function () {
  describe('camelCaseToTitleCase', function () {
    it('should convert a camel case string to title case', function () {
      const camelCaseString = 'termPattern';
      strictEqual(camelCaseToTitleCase(camelCaseString), 'Term Pattern');
    });
  });
});
