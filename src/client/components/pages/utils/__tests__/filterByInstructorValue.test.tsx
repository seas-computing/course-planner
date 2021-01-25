import { strictEqual } from 'assert';
import { testFourYearPlan } from 'testData';
import { filterByInstructorValues } from '../filterByInstructorValues';

describe('Instructor Filter Function', function () {
  const testData = testFourYearPlan;
  context('when no search value is provided', function () {
    it('should return the same multi-year plan list', function () {
      const filteredValueResult = filterByInstructorValues(testData, {});
      strictEqual(filteredValueResult, testData);
    });
  });
  context('when one search value is provided', function () {
    context('when the search term does not appear in the instructor values', function () {
      it('should return an empty array', function () {
        const filteredValueResult = filterByInstructorValues(
          testData,
          { 0: 'randomValue$#' }
        );
        strictEqual(filteredValueResult.length, 0);
      });
    });
    context('when the search term appears in the instructor values', function () {
      it('should return the the multi year plan that includes the search term', function () {
        const filteredValueResult = filterByInstructorValues(
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
        const filteredValueResult = filterByInstructorValues(
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
        const filteredValueResult = filterByInstructorValues(
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
