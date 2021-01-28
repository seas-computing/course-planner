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
  bioengineeringFacultyMember,
  facultyAbsenceResponse,
  facultyAbsenceRequest,
} from 'testData';
import { FacultyAPI } from 'client/api';
import { ManageFacultyResponseDTO } from 'common/dto/faculty/ManageFacultyResponse.dto';
import {
  strictEqual,
  deepStrictEqual,
  fail,
  notDeepStrictEqual,
  rejects,
} from 'assert';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { ABSENCE_TYPE } from 'common/constants';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import request, {
  AxiosResponse,
} from '../request';

describe('Faculty API', function () {
  let result: FacultyResponseDTO;
  let getStub: SinonStub;
  let putStub: SinonStub;
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
          const response = await FacultyAPI
            .getFacultySchedulesForYear(acadYear);
          result = response[0];
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
            await FacultyAPI.getAllFacultyMembers();
            fail('Did not throw an error');
          } catch (err) {
            strictEqual(err, error);
          }
        });
      });
    });
  });
  describe('PUT /api/faculty/absence/:id', function () {
    let editAbsenceResult: AbsenceResponseDTO;
    beforeEach(function () {
      putStub = stub(request, 'put');
    });
    context('when PUT request succeeds', function () {
      const newAbsenceType = ABSENCE_TYPE.SABBATICAL_ELIGIBLE;
      const editedAbsence = {
        ...facultyAbsenceResponse,
        type: newAbsenceType,
      };
      beforeEach(async function () {
        putStub.resolves({
          data: editedAbsence,
        } as AxiosResponse<AbsenceResponseDTO>);
        editAbsenceResult = await FacultyAPI
          .updateFacultyAbsence(editedAbsence);
      });
      it('should make a request to /api/faculty/absence/:id', function () {
        const [[path]] = putStub.args;
        strictEqual(path, `/api/faculty/absence/${facultyAbsenceRequest.id}`);
        strictEqual(putStub.callCount, 1);
      });
      it('should return the updated absence entry', function () {
        // verify that the object is different from the original
        notDeepStrictEqual(facultyAbsenceResponse, editAbsenceResult);
        // and then verify that we received back the edited object
        deepStrictEqual(editAbsenceResult, editedAbsence);
      });
    });
    context('when PUT request fails', function () {
      const newAbsenceType = ABSENCE_TYPE.PARENTAL_LEAVE;
      const errorMessage = 'There was a problem with editing an absence entry.';
      beforeEach(function () {
        putStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        return rejects(() => (FacultyAPI.updateFacultyAbsence({
          ...facultyAbsenceResponse,
          type: newAbsenceType,
        })), {
          name: 'Error',
          message: errorMessage,
        });
      });
    });
  });
});
describe('Faculty Admin API', function () {
  let getFacultyResult: ManageFacultyResponseDTO[];
  let createFacultyResult: ManageFacultyResponseDTO;
  let editFacultyResult: ManageFacultyResponseDTO;
  let getStub: SinonStub;
  let postStub: SinonStub;
  let putStub: SinonStub;
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
          getFacultyResult = await FacultyAPI.getAllFacultyMembers();
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
            await FacultyAPI.getAllFacultyMembers();
            fail('Did not throw an error');
          } catch (err) {
            deepStrictEqual(err, error);
          }
        });
      });
    });
  });
  describe('createFaculty', function () {
    beforeEach(function () {
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
        createFacultyResult = await FacultyAPI
          .createFaculty(newAppliedPhysicsFacultyMember);
      });
      it('should make the request to /api/faculty', function () {
        const [[path]] = postStub.args;
        strictEqual(path, '/api/faculty');
        strictEqual(postStub.callCount, 1);
      });
      it('should return the created faculty member', function () {
        deepStrictEqual(createFacultyResult, physicsFacultyMemberResponse);
      });
    });
    context('when POST request fails', function () {
      const errorMessage = 'There was a problem with creating a faculty.';
      beforeEach(function () {
        postStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        try {
          await FacultyAPI.createFaculty(newAppliedPhysicsFacultyMember);
          fail('Did not throw an error');
        } catch (err) {
          strictEqual((err as Error).message, errorMessage);
        }
      });
    });
  });
  describe('editFaculty', function () {
    beforeEach(function () {
      putStub = stub(request, 'put');
    });
    afterEach(function () {
      putStub.restore();
    });
    context('when PUT request succeeds', function () {
      const newLastName = 'Jones';
      const editedFacultyMember = {
        ...bioengineeringFacultyMember,
        lastName: newLastName,
      };
      const editedFacultyMemberResponse = {
        ...bioengineeringFacultyMemberResponse,
        lastName: newLastName,
      };
      beforeEach(async function () {
        putStub.resolves({
          data: editedFacultyMemberResponse,
        } as AxiosResponse<ManageFacultyResponseDTO>);
        editFacultyResult = await FacultyAPI
          .editFaculty(editedFacultyMember);
      });
      it('should make the request to /api/faculty/:id', function () {
        const [[path]] = putStub.args;
        strictEqual(path, `/api/faculty/${bioengineeringFacultyMember.id}`);
        strictEqual(putStub.callCount, 1);
      });
      it('should return the updated faculty member', function () {
        // verify that the object is different from the original
        notDeepStrictEqual(bioengineeringFacultyMember, editedFacultyMember);
        // and then verify that we received back the edited object
        deepStrictEqual(editFacultyResult, editedFacultyMemberResponse);
      });
    });
    context('when PUT request fails', function () {
      const errorMessage = 'There was a problem with editing a faculty entry.';
      beforeEach(function () {
        putStub.rejects(new Error(errorMessage));
      });
      it('should throw an error', async function () {
        try {
          await FacultyAPI.editFaculty(bioengineeringFacultyMember);
          fail('Did not throw an error');
        } catch (err) {
          strictEqual((err as Error).message, errorMessage);
        }
      });
    });
  });
});
