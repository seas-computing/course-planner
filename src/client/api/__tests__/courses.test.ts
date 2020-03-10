import {
  stub,
  SinonStub,
} from 'sinon';
import request, {
  AxiosResponse,
} from 'axios';
import {
  manageCourseResponseExample,
  anotherManageCourseResponseExample,
} from 'testData';
import * as api from 'client/api';
import { ManageCourseResponseDTO } from 'common/dto/courses/ManageCourseResponse.dto';
import { strictEqual } from 'assert';

describe('Course Admin API', function () {
  let result: ManageCourseResponseDTO[];
  let getStub: SinonStub;
  describe('GET', function () {
    beforeEach(async function () {
      getStub = stub(request, 'get');
      result = await api.getAllCourses();
    });
    afterEach(function () {
      getStub.restore();
    });
    describe('gets all courses', function () {
      context('when data fetch succeeds', function () {
        beforeEach(function () {
          getStub.resolves({
            data: [
              manageCourseResponseExample,
              anotherManageCourseResponseExample,
            ],
          } as AxiosResponse<ManageCourseResponseDTO[]>);
        });
        it('should call getAllCourses', function () {
          getStub();
          strictEqual(getStub.callCount, 1);
        });
      });
    });
  });
});
