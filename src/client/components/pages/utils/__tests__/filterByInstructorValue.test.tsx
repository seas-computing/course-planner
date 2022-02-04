import { strictEqual } from 'assert';
import { cs50CourseInstance, testFourYearPlan } from 'testData';
import { filterCoursesByInstructors, filterPlansByInstructors } from '../filterByInstructorValues';

describe('Instructor Filter Functions', function () {
  describe('filterPlansByInstructors', function () {
    const testData = testFourYearPlan;
    context('when no search value is provided', function () {
      it('should return the same multi-year plan list', function () {
        const filteredValueResult = filterPlansByInstructors(testData, {});
        strictEqual(filteredValueResult, testData);
      });
    });
    context('when one search value is provided', function () {
      context('when the search term does not appear in the instructor values', function () {
        it('should return an empty array', function () {
          const filteredValueResult = filterPlansByInstructors(
            testData,
            { 0: 'randomValue$#' }
          );
          strictEqual(filteredValueResult.length, 0);
        });
      });
      context('when the search term appears in the instructor values', function () {
        it('should return the the multi year plan that includes the search term', function () {
          const filteredValueResult = filterPlansByInstructors(
            testData,
            { 0: testData[0].semesters[0].instance.faculty[0][0] }
          );
          strictEqual(filteredValueResult.includes(testData[0]), true);
        });
      });
    });
    context('when multiple search terms are provided', function () {
      context('when the search terms do not appear in the instructor values', function () {
        it('should return an empty array', function () {
          const filteredValueResult = filterPlansByInstructors(
            testData,
            {
              0: 'randomValue$#',
              1: 'anotherRandomValue$#',
            }
          );
          strictEqual(filteredValueResult.length, 0);
        });
      });
      context('when the search terms appear in the instructor values', function () {
        it('should return the the multi year plans that include the search term', function () {
          const filteredValueResult = filterPlansByInstructors(
            testData,
            {
              0: testData[0].semesters[0].instance.faculty[0][0],
              1: testData[1].semesters[0].instance.faculty[0][0],
            }
          );
          strictEqual(filteredValueResult.includes(testData[0]), true, 'The result does not contain the first search term.');
          strictEqual(filteredValueResult.includes(testData[1]), true, 'The result does not contain the second search term.');
        });
      });
    });
  });
  describe('filterCoursesByInstructors', function () {
    const testData = [cs50CourseInstance];
    context('when the search term does not appear in any of the instructor display names', function () {
      it('should return an empty array', function () {
        const filteredValueResult = filterCoursesByInstructors(testData, 'randomValue$#', 'spring.instructors');
        strictEqual(filteredValueResult.length, 0);
      });
    });
    context('when the search term appears in the instructor display names', function () {
      it('should return the course that includes the search term', function () {
        // Ensure that the search term is included in at least one of the display names
        const testInstructorSearchTerm = testData[0].fall.instructors[0]
          .displayName.charAt(0);
        const filteredValueResult = filterCoursesByInstructors(testData, testInstructorSearchTerm, 'fall.instructors');
        strictEqual(filteredValueResult.includes(testData[0]), true);
      });
    });
  });
});
