import {
  stub,
  SinonStub,
} from 'sinon';
import request, {
  AxiosResponse,
} from 'axios';
import {
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  error,
} from 'testData';
import * as api from 'client/api';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse2.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';

describe('Faculty Admin API', function () {
  let result: ManageFacultyResponseDTO[];
  let getStub: SinonStub;
  describe('GET /faculty', function () {
    beforeEach(async function () {
      getStub = stub(request, 'get');
    });
    afterEach(function () {
      getStub.restore();
    });
    describe('gets all faculty', function () {
      context('when data fetch succeeds', function () {
        beforeEach(async function () {
          getStub.resolves({
            data: [
              physicsFacultyMemberResponse,
              bioengineeringFacultyMemberResponse,
            ],
          } as AxiosResponse<ManageFacultyResponseDTO[]>);
          result = await api.getAllFacultyMembers();
        });
        it('should call getAllFacultyMembers', function () {
          strictEqual(getStub.callCount, 1);
        });
        it('should request /api/faculty/', function () {
          const [[path]] = getStub.args;
          strictEqual(path, '/api/faculty/');
        });
        it('should return the faculty members', function () {
          deepStrictEqual(result,
            [
              physicsFacultyMemberResponse,
              bioengineeringFacultyMemberResponse,
            ]);
        });
      });
      context('when data fetch fails', function () {
        beforeEach(async function () {
          getStub.rejects();
        });
        it('should throw an error', async function () {
          try {
            await api.getAllFacultyMembers();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, error);
          }
        });
      });
    });
  });
});
