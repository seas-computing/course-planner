import {
  SinonStub,
  stub,
} from 'sinon';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from 'server/auth/authentication.guard';
import {
  deepStrictEqual,
  strictEqual,
} from 'assert';
import { Absence } from 'server/absence/absence.entity';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { FacultyScheduleController } from '../facultySchedule.controller';
import { FacultyScheduleService } from '../facultySchedule.service';
import { FacultyScheduleView } from '../FacultyScheduleView.entity';
import { FacultyScheduleSemesterView } from '../FacultyScheduleSemesterView.entity';
import { FacultyScheduleCourseView } from '../FacultyScheduleCourseView.entity';
import { Faculty } from '../faculty.entity';

describe('Faculty Schedule Controller', function () {
  let fsController: FacultyScheduleController;
  let fsService: FacultyScheduleService;
  let semesterService: SemesterService;
  const mockRepository: Record<string, SinonStub> = {};
  const fakeYearList = [
    2018,
    2019,
    2020,
    2021,
  ];
  beforeEach(async function () {
    const testModule = await Test.createTestingModule({
      controllers: [FacultyScheduleController],
      providers: [
        {
          provide: getRepositoryToken(Semester),
          useValue: {},
        },
        {
          provide: getRepositoryToken(FacultyScheduleView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(FacultyScheduleSemesterView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(FacultyScheduleCourseView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Absence),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockRepository,
        },
        FacultyScheduleService,
        SemesterService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    fsController = testModule
      .get<FacultyScheduleController>(FacultyScheduleController);
    fsService = testModule
      .get<FacultyScheduleService>(FacultyScheduleService);
    semesterService = testModule
      .get<SemesterService>(SemesterService);
  });
  describe('/faculty/schedule', function () {
    describe('Get all faculty', function () {
      let getStub: SinonStub;
      beforeEach(function () {
        getStub = stub(fsService, 'getAllByYear').resolves(null);
        stub(semesterService, 'getYearList').resolves(fakeYearList.map(String));
      });
      context('With the academic year parameter not set', function () {
        it('should call the service with the list of valid years in the database', async function () {
          await fsController.getAllFaculty();
          strictEqual(getStub.callCount, 1);
          deepStrictEqual(getStub.args[0][0], fakeYearList);
        });
      });
      context('With one valid academic year parameter', function () {
        it('should call the service with the provided argument', async function () {
          await fsController.getAllFaculty('2019');
          strictEqual(getStub.callCount, 1);
          strictEqual(getStub.args[0].length, 1);
          deepStrictEqual(getStub.args[0][0], [2019]);
        });
      });
      context('With multiple valid academic years', function () {
        it('should call the service with the provided multiple valid years', async function () {
          const validYearArgs = [2019, 2020];
          const controllerArgs = validYearArgs.join(',');
          await fsController.getAllFaculty(controllerArgs);
          strictEqual(getStub.callCount, 1);
          deepStrictEqual(getStub.args[0][0], validYearArgs);
        });
      });
      context('With duplicate valid years', function () {
        it('should call the service with the unique valid years', async function () {
          const years = [2019, 2020, 2020];
          const uniqueYears = Array.from(new Set(years));
          const controllerYears = years.join(',');
          await fsController.getAllFaculty(controllerYears);
          strictEqual(getStub.callCount, 1);
          deepStrictEqual(getStub.args[0][0], uniqueYears);
        });
      });
      context('With an invalid academic year', function () {
        it('should not call the service with the invalid year', async function () {
          await fsController.getAllFaculty('1980');
          strictEqual(getStub.callCount, 0);
          strictEqual(getStub.calledWith([1980]), false);
        });
      });
      context('With both invalid and valid academic years', function () {
        it('should only call the service with the valid years', async function () {
          const validYearArgs = [2018, 2020];
          const invalidYearArgs = [1910, 1800];
          await fsController.getAllFaculty([...validYearArgs, ...invalidYearArgs].join(','));
          strictEqual(getStub.callCount, 1);
          deepStrictEqual(getStub.args[0][0], validYearArgs);
        });
      });
    });
  });
});
