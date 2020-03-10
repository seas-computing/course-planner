import {
  stub,
  SinonStub,
} from 'sinon';
import request, {
  AxiosResponse,
} from 'axios';
import {
  manageCourseResponseExample, anotherManageCourseResponseExample,
} from 'testData';
import * as api from 'client/api';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
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
              manageCourseResponseExample,
              anotherManageCourseResponseExample,
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
            [manageCourseResponseExample, anotherManageCourseResponseExample]);
        });
      });
    });
  });
});
