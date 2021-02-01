import {
  stub,
  SinonStub,
} from 'sinon';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  error,
  createCourseDtoExample,
  updateCourseExample,
  computerScienceCourse,
} from 'testData';
import { CourseAPI } from 'client/api';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';
import request, {
  AxiosResponse,
} from '../request';

describe('Course Admin API', function () {
  let result: ManageCourseResponseDTO[];
  let createCourseResult: ManageCourseResponseDTO;
  let editCourseResult: ManageCourseResponseDTO;
  let getStub: SinonStub;
  let postStub: SinonStub;
  let putStub: SinonStub;
  describe('getAllCourses', function () {
    beforeEach(function () {
      getStub = stub(request, 'get');
    });
    afterEach(function () {
      getStub.restore();
    });
    describe('gets all courses', function () {
      context('when data fetch succeeds', function () {
        beforeEach(async function () {
          getStub.resolves({
            data: [
              computerScienceCourseResponse,
              physicsCourseResponse,
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
              computerScienceCourseResponse,
              physicsCourseResponse,
            ]);
        });
      });
      context('when data fetch fails', function () {
        beforeEach(function () {
          getStub.rejects();
        });
        it('should throw an error', async function () {
          try {
            await CourseAPI.getAllCourses();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, error);
          }
        });
      });
    });
    describe('createCourse', function () {
      beforeEach(function () {
        postStub = stub(request, 'post');
      });
      afterEach(function () {
        getStub.restore();
      });
      context('when successfully creating a course', function () {
        beforeEach(async function () {
          postStub.resolves({
            data: computerScienceCourseResponse,
          } as AxiosResponse<ManageCourseResponseDTO>);
          createCourseResult = await CourseAPI
            .createCourse(createCourseDtoExample);
        });
        it('should make the request to /api/courses/', function () {
          const [[path]] = postStub.args;
          strictEqual(path, '/api/courses/');
          strictEqual(postStub.callCount, 1);
        });
        it('should return the created course', function () {
          deepStrictEqual(createCourseResult, computerScienceCourseResponse);
        });
      });
      context('when failing to create a course', function () {
        const errorMessage = 'There was a problem with creating a course.';
        beforeEach(function () {
          postStub.rejects(new Error(errorMessage));
        });
        it('should throw an error', async function () {
          try {
            await CourseAPI.createCourse(createCourseDtoExample);
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
      afterEach(function () {
        putStub.restore();
      });
      context('when successfully editing a course', function () {
        const newCourseTitle = 'Intro to Engineering';
        const editedCourse = {
          ...computerScienceCourse,
          area: computerScienceCourse.area.name,
          title: newCourseTitle,
        };
        const editedCourseResponse = {
          ...computerScienceCourseResponse,
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
          strictEqual(path, `/api/courses/${updateCourseExample.id}`);
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
            await CourseAPI.editCourse(updateCourseExample);
            fail('Did not throw an error');
          } catch (err) {
            strictEqual((err as Error).message, errorMessage);
          }
        });
      });
    });
  });
});
