import {
  stub,
  SinonStub,
} from 'sinon';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  error,
  physicsCourse,
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
  describe('GET /courses', function () {
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
      context('when POST request succeeds', function () {
        beforeEach(async function () {
          postStub.resolves({
            data: physicsCourseResponse,
          } as AxiosResponse<ManageCourseResponseDTO>);
          createCourseResult = await CourseAPI.createCourse(physicsCourse);
        });
        it('should make the request to /api/course', function () {
          const [[path]] = postStub.args;
          strictEqual(path, '/api/course');
          strictEqual(postStub.callCount, 1);
        });
        it('should return the created course', function () {
          deepStrictEqual(createCourseResult, physicsCourseResponse);
        });
      });
      context('when POST request fails', function () {
        const errorMessage = 'There was a problem with creating a course.';
        beforeEach(function () {
          postStub.rejects(new Error(errorMessage));
        });
        it('should throw an error', async function () {
          try {
            await CourseAPI.createCourse(physicsCourse);
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
      context('when PUT request succeeds', function () {
        const newCourseTitle = 'Intro to Engineering';
        const editedCourse = {
          ...physicsCourse,
          title: newCourseTitle,
        };
        const editedCourseResponse = {
          ...physicsCourseResponse,
          title: newCourseTitle,
        };
        beforeEach(async function () {
          putStub.resolves({
            data: editedCourseResponse,
          } as AxiosResponse<ManageCourseResponseDTO>);
          editCourseResult = await CourseAPI.editCourse(editedCourse);
        });
        it('should make a request to /api/course/:id', function () {
          const [[path]] = putStub.args;
          strictEqual(path, `/api/course/${physicsCourse.id}`);
          strictEqual(putStub.callCount, 1);
        });
        it('should return the updated course', function () {
          deepStrictEqual(editCourseResult, editedCourseResponse);
        });
      });
      context('when PUT request fails', function () {
        const errorMessage = 'There was a problem with editing the course entry.';
        beforeEach(function () {
          putStub.rejects(new Error(errorMessage));
        });
        it('should throw an error', async function () {
          try {
            await CourseAPI.editCourse(physicsCourse);
            fail('Did not throw an error');
          } catch (err) {
            strictEqual((err as Error).message, errorMessage);
          }
        });
      });
    });
  });
});
