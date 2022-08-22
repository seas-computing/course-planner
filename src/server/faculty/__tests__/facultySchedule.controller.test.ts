import {
  SinonStub,
  stub,
} from 'sinon';
import { Test } from '@nestjs/testing';
import { Authentication } from 'server/auth/authentication.guard';
import {
  deepStrictEqual,
  strictEqual,
  rejects,
} from 'assert';
import { SemesterService } from 'server/semester/semester.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Area } from 'server/area/area.entity';
import { Absence } from 'server/absence/absence.entity';
import { facultyAbsenceRequest, facultyAbsenceResponse } from 'testData';
import { ABSENCE_TYPE } from 'common/constants';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { AbsenceResponseDTO } from 'common/dto/faculty/AbsenceResponse.dto';
import { ConfigModule } from 'server/config/config.module';
import { FacultyController } from '../faculty.controller';
import { FacultyScheduleService } from '../facultySchedule.service';
import { Faculty } from '../faculty.entity';
import { FacultyService } from '../faculty.service';

describe('Faculty Schedule Controller', function () {
  let fsController: FacultyController;
  let getAllByYearStub: SinonStub;
  let getYearListStub: SinonStub;
  let findStub: SinonStub;
  let updateFacultyAbsencesStub: SinonStub;
  const mockRepository: Record<string, SinonStub> = {};
  let mockAbsenceRepository: Record<string, SinonStub>;
  const fakeYearList = [
    2018,
    2019,
    2020,
    2021,
  ];
  beforeEach(async function () {
    getAllByYearStub = stub();
    getYearListStub = stub();
    updateFacultyAbsencesStub = stub();
    mockAbsenceRepository = {
      findOne: stub(),
      save: stub(),
    };
    const testModule = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [FacultyController],
      providers: [
        {
          provide: FacultyScheduleService,
          useValue: {
            getAllByYear: getAllByYearStub,
          },
        },
        {
          provide: SemesterService,
          useValue: {
            getYearList: getYearListStub,
          },
        },
        {
          provide: FacultyService,
          useValue: {
            find: findStub,
            updateFacultyAbsences: updateFacultyAbsencesStub,
          },
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Absence),
          useValue: mockAbsenceRepository,
        },
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    fsController = testModule
      .get<FacultyController>(FacultyController);
  });
  describe('/faculty/schedule', function () {
    describe('Get all faculty', function () {
      beforeEach(function () {
        getAllByYearStub.resolves(null);
        getYearListStub.resolves(fakeYearList.map(String));
      });
      context('With the academic year parameter not set', function () {
        it('should call the service with the list of valid years in the database', async function () {
          await fsController.getAllFaculty();
          strictEqual(getAllByYearStub.callCount, 1);
          deepStrictEqual(getAllByYearStub.args[0][0], fakeYearList);
        });
      });
      context('With one valid academic year parameter', function () {
        it('should call the service with the provided argument', async function () {
          await fsController.getAllFaculty('2019');
          strictEqual(getAllByYearStub.callCount, 1);
          strictEqual(getAllByYearStub.args[0].length, 1);
          deepStrictEqual(getAllByYearStub.args[0][0], [2019]);
        });
      });
      context('With multiple valid academic years', function () {
        it('should call the service with the provided multiple valid years', async function () {
          const validYearArgs = [2019, 2020];
          const controllerArgs = validYearArgs.join(',');
          await fsController.getAllFaculty(controllerArgs);
          strictEqual(getAllByYearStub.callCount, 1);
          deepStrictEqual(getAllByYearStub.args[0][0], validYearArgs);
        });
      });
      context('With duplicate valid years', function () {
        it('should call the service with the unique valid years', async function () {
          const years = [2019, 2020, 2020];
          const uniqueYears = Array.from(new Set(years));
          const controllerYears = years.join(',');
          await fsController.getAllFaculty(controllerYears);
          strictEqual(getAllByYearStub.callCount, 1);
          deepStrictEqual(getAllByYearStub.args[0][0], uniqueYears);
        });
      });
      context('With an invalid academic year', function () {
        it('should not call the service with the invalid year', async function () {
          await fsController.getAllFaculty('1980');
          strictEqual(getAllByYearStub.callCount, 0);
          strictEqual(getAllByYearStub.calledWith([1980]), false);
        });
      });
      context('With both invalid and valid academic years', function () {
        it('should only call the service with the valid years', async function () {
          const validYearArgs = [2018, 2020];
          const invalidYearArgs = [1910, 1800];
          await fsController.getAllFaculty([...validYearArgs, ...invalidYearArgs].join(','));
          strictEqual(getAllByYearStub.callCount, 1);
          deepStrictEqual(getAllByYearStub.args[0][0], validYearArgs);
        });
      });
    });
  });
  describe('/faculty/absence/:id', function () {
    describe('Update faculty absence', function () {
      const updatedAbsence: AbsenceResponseDTO = {
        ...facultyAbsenceRequest,
        type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
      };
      context('when absence record exists', function () {
        beforeEach(function () {
          mockAbsenceRepository
            .findOne
            .resolves(facultyAbsenceResponse);
          mockAbsenceRepository.save.resolves(updatedAbsence);
          updateFacultyAbsencesStub.resolves(updatedAbsence);
        });
        it('updates the absence record', async function () {
          await fsController
            .updateFacultyAbsence(updatedAbsence);
          strictEqual(updateFacultyAbsencesStub.callCount, 1);
        });
        it('returns the updated absence record', async function () {
          const newlyUpdatedAbsence = await fsController
            .updateFacultyAbsence(updatedAbsence);
          deepStrictEqual(newlyUpdatedAbsence, updatedAbsence);
        });
      });
      context('when absence record does not exist', function () {
        it('throws a Not Found Error', async function () {
          updateFacultyAbsencesStub
            .rejects(new NotFoundException('The entered Absence does not exist'));
          return rejects(
            () => (fsController.updateFacultyAbsence(updatedAbsence)), {
              message: 'The entered Absence does not exist',
            }
          );
        });
      });
      context('when there are other errors', function () {
        it('allows other error types to bubble up', async function () {
          mockAbsenceRepository
            .findOne
            .rejects(new InternalServerErrorException());
          try {
            await fsController
              .updateFacultyAbsence(updatedAbsence);
          } catch (e) {
            strictEqual(e instanceof Error, true);
            strictEqual(e instanceof NotFoundException, false);
            strictEqual((e.message as string).includes('Internal Server Error'), true);
          }
        });
      });
    });
  });
});
