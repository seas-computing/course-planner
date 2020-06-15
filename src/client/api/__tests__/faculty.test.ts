import {
  stub,
  SinonStub,
} from 'sinon';
import {
  physicsFacultyMemberResponse,
  bioengineeringFacultyMemberResponse,
  error,
  appliedMathFacultyScheduleResponse,
  newAppliedPhysicsFacultyMember,
  appliedMathFacultyMember,
} from 'testData';
import * as api from 'client/api';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
} from 'assert';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import request, {
  AxiosResponse,
} from '../request';

describe('Faculty API', function () {
  let result: FacultyResponseDTO;
  let getStub: SinonStub;
  describe('GET /faculty/schedule', function () {
    beforeEach(function () {
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
              [acadYear]: [
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
        beforeEach(function () {
          getStub.rejects(error);
        });
        it('should throw an error', async function () {
          try {
            await api.getAllFacultyMembers();
            fail('Did not throw an error');
          } catch (err) {
            strictEqual(err, error);
          }
        });
      });
    });
  });
});
describe('Faculty Admin API', function () {
  let getFacultyResult: ManageFacultyResponseDTO[];
  let createFacultyResult: ManageFacultyResponseDTO;
  let getStub: SinonStub;
  let postStub: SinonStub;
  describe('GET /faculty', function () {
    beforeEach(function () {
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
          getFacultyResult = await api.getAllFacultyMembers();
        });
        it('should call getAllFacultyMembers', function () {
          strictEqual(getStub.callCount, 1);
        });
        it('should request /api/faculty/', function () {
          const [[path]] = getStub.args;
          strictEqual(path, '/api/faculty/');
        });
        it('should return the faculty members', function () {
          deepStrictEqual(getFacultyResult,
            [
              physicsFacultyMemberResponse,
              bioengineeringFacultyMemberResponse,
            ]);
        });
      });
      context('when data fetch fails', function () {
        beforeEach(function () {
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
  describe('POST /faculty', function () {
    beforeEach(async function () {
      postStub = stub(request, 'post');
    });
    afterEach(function () {
      postStub.restore();
    });
    context('when POST request succeeds', function () {
      beforeEach(async function () {
        postStub.resolves({
          data: physicsFacultyMemberResponse,
        } as AxiosResponse<ManageFacultyResponseDTO>);
        createFacultyResult = await api
          .createFaculty(newAppliedPhysicsFacultyMember);
      });
      it('should call createFaculty', function () {
        strictEqual(postStub.callCount, 1);
      });
      it('should make the request to /api/faculty', function () {
        const [[path]] = postStub.args;
        strictEqual(path, '/api/faculty');
      });
      it('should return the created faculty member', function () {
        deepStrictEqual(createFacultyResult, physicsFacultyMemberResponse);
      });
    });
    context('when POST request fails', function () {
      beforeEach(async function () {
        postStub.rejects();
      });
      it('should throw an error', async function () {
        try {
          await api.createFaculty(newAppliedPhysicsFacultyMember);
          fail('Did not throw an error');
        } catch (err) {
          deepStrictEqual(err, error);
        }
      });
    });
  });
});
