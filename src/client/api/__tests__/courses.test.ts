import {
  stub,
  SinonStub,
} from 'sinon';
import {
  computerScienceCourseResponse,
  physicsCourseResponse,
  error,
} from 'common/data';
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
  let getStub: SinonStub;
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
  });
});
