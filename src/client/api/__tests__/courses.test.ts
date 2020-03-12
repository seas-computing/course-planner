import {
  stub,
  SinonStub,
} from 'sinon';
import request, {
  AxiosResponse,
} from 'axios';
import * as dummy from 'testData';
import * as api from 'client/api';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';

describe('Course Admin API', function () {
  let result: ManageCourseResponseDTO[];
  let getStub: SinonStub;
  describe('GET', function () {
    beforeEach(async function () {
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
              dummy.computerScienceCourseResponse,
              dummy.physicsCourseResponse,
            ],
          } as AxiosResponse<ManageCourseResponseDTO[]>);
          result = await api.getAllCourses();
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
        beforeEach(async function () {
          getStub.rejects();
        });
        it('should throw an error', async function () {
          try {
            await api.getAllCourses();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, dummy.error);
          }
        });
      });
    });
  });
});
