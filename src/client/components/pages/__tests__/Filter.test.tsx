import { deepStrictEqual } from 'assert';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  newAreaCourseResponse,
} from 'testData';
import listFilter from '../Filter';

describe('Filter Functions', function () {
  const testData = [
    computerScienceCourseResponse,
    physicsCourseResponse,
    newAreaCourseResponse,
  ];
  describe('Filter field not exist in the list', function () {
    it('should return empty list', function () {
      const courses = listFilter(
        testData,
        { field: 'RandomFieldName', value: 'CS 050', exact: false }
      );
      deepStrictEqual(courses, []);
    });
  });
  describe('Filter field and/or value is/are empty', function () {
    it('field is empty: should return the same list', function () {
      const courses = listFilter(
        testData,
        { field: 'catalogNumber', value: '', exact: false }
      );
      deepStrictEqual(courses, testData);
    });
    it('value is empty: should return the same list', function () {
      const courses = listFilter(
        testData,
        { field: '', value: 'CS 050', exact: false }
      );
      deepStrictEqual(courses, testData);
    });
  });
  describe('One level filter', function () {
    it('should return computerScienceCourseResponse', function () {
      const courses = listFilter(
        testData,
        { field: 'catalogNumber', value: 'CS 050', exact: false }
      );
      deepStrictEqual(courses, [computerScienceCourseResponse]);
    });
    it('should return physicsCourseResponse', function () {
      const courses = listFilter(
        testData,
        { field: 'catalogNumber', value: 'AP 295a', exact: false }
      );
      deepStrictEqual(courses, [physicsCourseResponse]);
    });
    it('should return computer followed by physics courses ', function () {
      const courses = listFilter(
        testData,
        { field: 'catalogNumber', value: '5', exact: false }
      );
      const retval = [computerScienceCourseResponse, physicsCourseResponse];
      deepStrictEqual(courses, retval);
    });
    it('should return all the testData ', function () {
      const courses = listFilter(
        testData,
        { field: 'title', value: 'Introduction', exact: false }
      );
      deepStrictEqual(courses, testData);
    });
    it('should return empty ', function () {
      const courses = listFilter(
        testData,
        { field: 'title', value: 'RandomValue', exact: false }
      );
      deepStrictEqual(courses, []);
    });
  });
  describe('Two levels filter', function () {
    it('should return physicsCourseResponse', function () {
      const courses = listFilter(
        testData,
        { field: 'area.name', value: 'CS', exact: true }
      );
      deepStrictEqual(courses, [computerScienceCourseResponse]);
    });
    it('should return null', function () {
      const courses = listFilter(
        testData,
        { field: 'area.name', value: 'RandomValue', exact: true }
      );
      deepStrictEqual(courses, []);
    });
  });
  describe('Multiple filters', function () {
    it('should return computerScienceCourseResponse', function () {
      let courses = listFilter(
        testData,
        { field: 'title', value: 'Introduction', exact: false }
      );
      courses = listFilter(
        courses,
        { field: 'area.name', value: 'CS', exact: true }
      );
      deepStrictEqual(courses, [computerScienceCourseResponse]);
    });
    it('should return empty', function () {
      let courses = listFilter(
        testData,
        { field: 'title', value: 'RandomValue', exact: false }
      );
      courses = listFilter(
        courses,
        { field: 'area.name', value: 'CS', exact: true }
      );
      deepStrictEqual(courses, []);
    });
  });
});
