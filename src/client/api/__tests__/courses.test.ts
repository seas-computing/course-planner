import {
  stub,
  SinonStub,
} from 'sinon';
import * as dummy from 'testData';
import { CourseAPI } from 'client/api';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
  rejects,
} from 'assert';
import { TermKey } from 'common/constants/term';
import { cs50CourseInstance } from 'testData';
import CourseInstanceUpdateDTO from 'common/dto/courses/CourseInstanceUpdate.dto';
import request, {
  AxiosResponse,
} from '../request';
import { OFFERED, TERM } from '../../../common/constants';

describe('Course Admin API', function () {
  let result: ManageCourseResponseDTO[];
  let createCourseResult: ManageCourseResponseDTO;
  let editCourseResult: ManageCourseResponseDTO;
  let editCourseInstanceResult: CourseInstanceUpdateDTO;
  let getStub: SinonStub;
  let postStub: SinonStub;
  let putStub: SinonStub;
  describe('getAllCourses', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    context('when data fetch succeeds', function () {
      beforeEach(async function () {
        getStub.resolves({
          data: [
            dummy.computerScienceCourseResponse,
            dummy.physicsCourseResponse,
          ],
        } as AxiosResponse<ManageCourseResponseDTO[]>);
        result = await CourseAPI.getAllCourses();
      });
      it('should call getAllCourses', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('should request /api/courses/', function () {
        const [[path]] = getStub.args;
        strictEqual(path, '/api/courses/');
      });
      it('should return the courses', function () {
        deepStrictEqual(result,
          [
            dummy.computerScienceCourseResponse,
            dummy.physicsCourseResponse,
          ]);
      });
    });
    context('when data fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      it('should throw an error', async function () {
        try {
          await CourseAPI.getAllCourses();
          fail('Did not throw an error');
        } catch (err) {
          deepStrictEqual(err, dummy.error);
        }
      });
    });
  });
  describe('createCourse', function () {
    beforeEach(function () {
      postStub = stub(request, 'post');
    });
    context('when successfully creating a course', function () {
      beforeEach(async function () {
        postStub.resolves({
          data: dummy.computerScienceCourseResponse,
        } as AxiosResponse<ManageCourseResponseDTO>);
        createCourseResult = await CourseAPI
          .createCourse(dummy.createCourseDtoExample);
      });
      it('should make the request to /api/courses/', function () {
        const [[path]] = postStub.args;
        strictEqual(path, '/api/courses/');
        strictEqual(postStub.callCount, 1);
      });
      it('should return the created course', function () {
        deepStrictEqual(
          createCourseResult,
          dummy.computerScienceCourseResponse
        );
      });
    });
    context('when failing to create a course', function () {
      const errorMessage = 'There was a problem with creating a course.';
      beforeEach(function () {
        postStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        try {
          await CourseAPI.createCourse(dummy.createCourseDtoExample);
          fail('Did not throw an error');
        } catch (err) {
          strictEqual((err as Error).message, errorMessage);
        }
      });
    });
  });
  describe('editCourse', function () {
    beforeEach(function () {
      putStub = stub(request, 'put');
    });
    context('when successfully editing a course', function () {
      const newCourseTitle = 'Intro to Engineering';
      const editedCourse = {
        ...dummy.computerScienceCourse,
        area: dummy.computerScienceCourse.area.name,
        title: newCourseTitle,
      };
      const editedCourseResponse = {
        ...dummy.computerScienceCourseResponse,
        title: newCourseTitle,
      };
      beforeEach(async function () {
        putStub.resolves({
          data: editedCourseResponse,
        } as AxiosResponse<ManageCourseResponseDTO>);
        editCourseResult = await CourseAPI.editCourse(editedCourse);
      });
      it('should make a request to /api/courses/:id', function () {
        const [[path]] = putStub.args;
        strictEqual(path, `/api/courses/${dummy.updateCourseExample.id}`);
        strictEqual(putStub.callCount, 1);
      });
      it('should return the updated course', function () {
        deepStrictEqual(editCourseResult, editedCourseResponse);
      });
    });
    context('when failing to edit a course', function () {
      const errorMessage = 'There was a problem with editing the course entry.';
      beforeEach(function () {
        putStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        try {
          await CourseAPI.editCourse(dummy.updateCourseExample);
          fail('Did not throw an error');
        } catch (err) {
          strictEqual((err as Error).message, errorMessage);
        }
      });
    });
  });
  describe('getCourseInstancesForYear', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    context('When fetch succeeds', function () {
      const testResponse = [
        dummy.cs50CourseInstance,
        dummy.ac209aCourseInstance,
      ];
      beforeEach(function () {
        getStub.resolves({
          data: testResponse,
        });
      });
      it('Should return the data portion of the request', async function () {
        const testResult = await CourseAPI.getCourseInstancesForYear(2021);
        deepStrictEqual(testResult, testResponse);
      });
    });
    context('When fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      it('should throw an error', function () {
        return rejects(
          () => CourseAPI.getCourseInstancesForYear(2021),
          dummy.error
        );
      });
    });
  });
  describe('getCourseScheduleForSemester', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    context('When fetch succeeds', function () {
      const testResponse = [
        dummy.testCourseScheduleData,
      ];
      beforeEach(function () {
        getStub.resolves({
          data: testResponse,
        });
      });
      it('Should return the data portion of the request', async function () {
        const testResult = await CourseAPI
          .getCourseScheduleForSemester(2021, TERM.FALL);
        deepStrictEqual(testResult, testResponse);
      });
    });
    context('When fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      it('should throw an error', function () {
        return rejects(
          () => CourseAPI.getCourseScheduleForSemester(2021, TERM.FALL),
          dummy.error
        );
      });
    });
  });
  describe('updateCourseInstance', function () {
    beforeEach(function () {
      putStub = stub(request, 'put');
    });
    const spring = TERM.SPRING.toLowerCase() as TermKey;
    const newOfferedValue = OFFERED.Y;
    const editedCourseInstance: CourseInstanceUpdateDTO = {
      offered: newOfferedValue,
      preEnrollment: null,
      studyCardEnrollment: null,
      actualEnrollment: null,
    };
    context('when successfully editing a course instance', function () {
      beforeEach(async function () {
        putStub.resolves({
          data: editedCourseInstance,
        } as AxiosResponse<CourseInstanceUpdateDTO>);
        editCourseInstanceResult = await CourseAPI.updateCourseInstance(
          cs50CourseInstance[spring].id, {
            offered: newOfferedValue,
            preEnrollment: cs50CourseInstance[spring].preEnrollment,
            studyCardEnrollment: cs50CourseInstance[spring].studyCardEnrollment,
            actualEnrollment: cs50CourseInstance[spring].actualEnrollment,
          }
        );
      });
      it('should make a request to /api/course-instances/:id', function () {
        const [[path]] = putStub.args;
        strictEqual(path, `/api/course-instances/${cs50CourseInstance[spring].id}`);
        strictEqual(putStub.callCount, 1);
      });
      it('should return the updated course', function () {
        deepStrictEqual(editCourseInstanceResult, editedCourseInstance);
      });
    });
    context('when failing to edit a course instance', function () {
      const errorMessage = 'There was a problem with editing the course entry.';
      beforeEach(function () {
        putStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        try {
          editCourseInstanceResult = await CourseAPI.updateCourseInstance(
            cs50CourseInstance[spring].id, editedCourseInstance
          );
          fail('Did not throw an error');
        } catch (err) {
          strictEqual((err as Error).message, errorMessage);
        }
      });
    });
  });
  describe('getRoomScheduleForSemester', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    context('When fetch succeeds', function () {
      const testResponse = [
        dummy.testRoomScheduleData,
      ];
      beforeEach(function () {
        getStub.resolves({
          data: testResponse,
        });
      });
      it('Should return the data portion of the request', async function () {
        const testResult = await CourseAPI
          .getRoomScheduleForSemester(dummy.freeRoom.id, 2021, TERM.FALL);
        deepStrictEqual(testResult, testResponse);
      });
    });
    context('When fetch fails', function () {
      beforeEach(function () {
        getStub.rejects(dummy.error);
      });
      it('should throw an error', function () {
        return rejects(
          () => CourseAPI.getRoomScheduleForSemester(
            dummy.freeRoom.id, 2021, TERM.FALL
          ),
          dummy.error
        );
      });
    });
  });
});
