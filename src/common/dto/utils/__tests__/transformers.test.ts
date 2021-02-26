import { strictEqual } from 'assert';
import { computerScienceCourseResponse, physicsCourseResponse } from 'testData';
import { trimString } from '../transformers';

describe('DTO Helper Functions', function () {
  describe('trimIfString', function () {
    context('when there is whitespace surrounding a string', function () {
      it('should remove the surrounding whitespace', function () {
        const stringWithWhitespace = `  ${computerScienceCourseResponse.catalogNumber} `;
        const trimmedString = stringWithWhitespace.trim();
        strictEqual(trimString(stringWithWhitespace), trimmedString);
      });
    });
    context('when there is no whitespace surrounding the string', function () {
      it('should return the original string', function () {
        const stringWithoutWhitespace = physicsCourseResponse.catalogNumber;
        strictEqual(
          trimString(stringWithoutWhitespace),
          physicsCourseResponse.catalogNumber
        );
      });
    });
    context('when no value is passed to the function', function () {
      it('should return empty string', function () {
        strictEqual(trimString(), '');
      });
    });
  });
});
