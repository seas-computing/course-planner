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
  appliedMathFacultyScheduleResponse,
} from 'testData';
import * as api from 'client/api';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';

describe('Faculty API', function () {
  let result: FacultyResponseDTO;
  let getStub: SinonStub;
  describe('GET /faculty/schedule', function () {
    beforeEach(async function () {
      getStub = stub(request, 'get');
    });
    afterEach(function () {
      getStub.restore();
    });
    describe('gets all faculty schedules', function () {
      const acadYear = 2021;
      context('when data fetch succeeds', function () {
        beforeEach(async function () {
          getStub.resolves({
            data: {
              2021: [
                appliedMathFacultyScheduleResponse,
              ],
            },
          });
          const response = await api.getFacultySchedulesForYear(acadYear);
          result = response[acadYear][0];
        });
        it('should call getAllFacultySchedules', function () {
          strictEqual(getStub.callCount, 1);
        });
        it('should make a request to the faculty schedule API for the specified academic year', function () {
          const [[path]] = getStub.args;
          strictEqual(path, `/api/faculty/schedule?acadYears=${acadYear}`);
        });
        it('should return the faculty schedules', function () {
          deepStrictEqual(result, appliedMathFacultyScheduleResponse);
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
