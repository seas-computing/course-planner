import {
  SinonStub,
  stub,
} from 'sinon';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from 'server/auth/authentication.guard';
import { ConfigService } from 'server/config/config.service';
import { deepStrictEqual } from 'assert';
import { FacultyScheduleController } from '../facultySchedule.controller';
import { FacultyScheduleService } from '../facultySchedule.service';
import { FacultyScheduleView } from '../FacultyScheduleView.entity';
import { FacultyScheduleSemesterView } from '../FacultyScheduleSemesterView.entity';
import { FacultyScheduleCourseView } from '../FacultyScheduleCourseView.entity';
import { FacultyScheduleAbsenceView } from '../FacultyScheduleAbsenceView.entity';
import { Faculty } from '../faculty.entity';

describe('Faculty Schedule Controller', function () {
  let fsController: FacultyScheduleController;
  let fsService: FacultyScheduleService;
  let configService: ConfigService;
  const mockRepository: Record<string, SinonStub> = {};
  beforeEach(async function () {
    const testModule = await Test.createTestingModule({
      controllers: [FacultyScheduleController],
      providers: [
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
          provide: getRepositoryToken(FacultyScheduleAbsenceView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockRepository,
        },
        ConfigService,
        FacultyScheduleService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    fsController = testModule
      .get<FacultyScheduleController>(FacultyScheduleController);
    fsService = testModule
      .get<FacultyScheduleService>(FacultyScheduleService);
    configService = testModule
      .get<ConfigService>(ConfigService);
  });
  describe('/faculty/schedule', function () {
    let getStub: SinonStub;
    beforeEach(function () {
      getStub = stub(fsService, 'getAllFaculty').resolves(null);
      stub(configService, 'academicYear').get(() => 2020);
    });
    context('When academic year parameter is not set', function () {
      it('should call the service with the undefined argument', async function () {
        await fsController.getAll();
        deepStrictEqual(getStub.args, [[undefined]]);
      });
    });
  });
});
