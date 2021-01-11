import { strictEqual } from 'assert';
import { computerScienceCourseResponse, physicsCourseResponse } from 'testData';
import { trimIfString } from '../util';

describe('DTO Helper Functions', function () {
  describe('trimIfString', function () {
    context('when there is whitespace surrounding a string', function () {
      it('should remove the surrounding whitespace', function () {
        const stringWithWhitespace = `  ${computerScienceCourseResponse.catalogNumber} `;
        const trimmedString = stringWithWhitespace.trim();
        strictEqual(trimIfString(stringWithWhitespace), trimmedString);
      });
    });
    context('when there is no whitespace surrounding the string', function () {
      it('should return the original string', function () {
        const stringWithoutWhitespace = physicsCourseResponse.catalogNumber;
        strictEqual(
          trimIfString(stringWithoutWhitespace),
          physicsCourseResponse.catalogNumber
        );
      });
    });
  });
});
