import { strictEqual } from 'assert';
import { TERM } from 'common/constants';
import { am105CourseInstance } from 'testData';
import { getInstanceIdentifier } from '../getInstanceIdentifier';

describe('getInstanceIdentifier function', function () {
  const testAcademicYear = '2023';
  context('when the semester term is TERM.FALL', function () {
    const testSemester = {
      term: TERM.FALL,
      academicYear: testAcademicYear,
    };
    it('should return the identifier with the calendar year', function () {
      const identifier = getInstanceIdentifier(
        am105CourseInstance, testSemester
      );
      const calendarYear = parseInt(testSemester.academicYear, 10) - 1;
      strictEqual(identifier.includes(calendarYear.toString()), true);
    });
  });
  context('when the semester term is TERM.SPRING', function () {
    const testSemester = {
      term: TERM.SPRING,
      academicYear: testAcademicYear,
    };
    it('should return the identifier with the academic year', function () {
      const identifier = getInstanceIdentifier(
        am105CourseInstance, testSemester
      );
      strictEqual(identifier.includes(testAcademicYear), true);
    });
  });
});
