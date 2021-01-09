import { strictEqual } from 'assert';
import { trimIfString } from '../util';

describe('DTO Helper Functions', function () {
  describe('trimIfString', function () {
    it('should remove the whitespace surrounding a string', function () {
      const stringWithWhitespace = '  CS 050 ';
      const trimmedString = stringWithWhitespace.trim();
      strictEqual(trimIfString(stringWithWhitespace), trimmedString);
    });
  });
});
