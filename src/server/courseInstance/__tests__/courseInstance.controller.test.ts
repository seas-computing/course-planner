import { deepStrictEqual, strictEqual, rejects } from 'assert';
import { stub, SinonStub } from 'sinon';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from 'server/auth/authentication.guard';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { ConfigService } from 'server/config/config.service';
import { Course } from 'server/course/course.entity';
import {
  testFourYearPlan,
  testMultiYearPlanStartYear,
  testFourYearPlanAcademicYears,
  testCourseScheduleData,
  testRoomScheduleData,
} from 'testData';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Area } from 'server/area/area.entity';
import { SemesterView } from 'server/semester/SemesterView.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Absence } from 'server/absence/absence.entity';
import { LogModule } from 'server/log/log.module';
import { RoomScheduleResponseDTO } from 'common/dto/schedule/roomSchedule.dto';
import { Room } from 'server/location/room.entity';
import { EntityNotFoundError } from 'typeorm';
import { CourseInstanceService } from '../courseInstance.service';
import { CourseInstanceController } from '../courseInstance.controller';
import { MultiYearPlanView } from '../MultiYearPlanView.entity';
import { MultiYearPlanInstanceView } from '../MultiYearPlanInstanceView.entity';
import { ScheduleBlockView } from '../ScheduleBlockView.entity';
import { ScheduleEntryView } from '../ScheduleEntryView.entity';
import { ScheduleViewResponseDTO } from '../../../common/dto/schedule/schedule.dto';
import { TERM, AUTH_MODE } from '../../../common/constants';
import { CourseInstance } from '../courseinstance.entity';
import { Faculty } from '../../faculty/faculty.entity';
import { FacultyCourseInstance } from '../facultycourseinstance.entity';
import { AuthModule } from '../../auth/auth.module';
import { TestingStrategy } from '../../../../tests/mocks/authentication/testing.strategy';
import { ConfigModule } from '../../config/config.module';
import { CourseInstanceListingView } from '../CourseInstanceListingView.entity';
import { RoomScheduleBlockView } from '../RoomScheduleBlockView.entity';

describe('Course Instance Controller', function () {
  let ciController: CourseInstanceController;
  let ciService: CourseInstanceService;
  let semesterService: SemesterService;
  let configService: ConfigService;
  const mockRepository: Record<string, SinonStub> = {};
  let mockRoomRepository: Record<string, SinonStub>;
  const fakeYearList = [
    '2018',
    '2019',
    '2020',
    '2021',
  ];
  beforeEach(async function () {
    mockRoomRepository = {
      findOneOrFail: stub(),
    };
    const testModule = await Test.createTestingModule({
      controllers: [CourseInstanceController],
      imports: [
        ConfigModule,
        LogModule,
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(Semester),
          useValue: {},
        },
        {
          provide: getRepositoryToken(CourseListingView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MultiYearPlanView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MultiYearPlanInstanceView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ScheduleBlockView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ScheduleEntryView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CourseInstance),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(FacultyCourseInstance),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Absence),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NonClassEvent),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CourseInstanceListingView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(SemesterView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(RoomScheduleBlockView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRoomRepository,
        },
        ConfigService,
        CourseInstanceService,
        SemesterService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .overrideProvider(ConfigService)
      .useValue(new ConfigService())
      .compile();

    semesterService = testModule
      .get<SemesterService>(SemesterService);
    ciService = testModule
      .get<CourseInstanceService>(CourseInstanceService);
    configService = testModule
      .get<ConfigService>(ConfigService);
    ciController = testModule
      .get<CourseInstanceController>(CourseInstanceController);
  });
  describe('/', function () {
    describe('Get all course instances', function () {
      let getStub: SinonStub;
      beforeEach(function () {
        getStub = stub(ciService, 'getAllByYear').resolves();
        stub(semesterService, 'getYearList').resolves(fakeYearList);
      });
      context('With no year parameter', function () {
        it('Should return an empty array', async function () {
          const result = await ciController.getInstances();
          deepStrictEqual(result, []);
        });
      });
      context('With one valid acadYear parameter', function () {
        it('Should call the service with that year', async function () {
          await ciController.getInstances('2019');
          strictEqual(getStub.callCount, 1);
          strictEqual(getStub.args[0].length, 1);
          deepStrictEqual(getStub.args[0][0], 2019);
        });
      });
      context('With multiple valid acadYears passed in a comma-separated list', function () {
        it('Should only call the service for first year in the list', async function () {
          const yearArgs = ['2020', '2018'];
          await ciController.getInstances(yearArgs.join(','));
          strictEqual(getStub.callCount, 1);
          strictEqual(getStub.args[0][0], parseInt(yearArgs[0], 10));
          strictEqual(getStub.calledWith(yearArgs[1]), false);
        });
      });
      context('With only an invalid acadYear parameter', function () {
        it('Should not call the function for that year', async function () {
          await ciController.getInstances('1999');
          strictEqual(getStub.callCount, 0);
          strictEqual(getStub.calledWith(1999), false);
        });
      });
    });
  });
  describe('/multi-year-plan', function () {
    let getStub: SinonStub;
    beforeEach(function () {
      stub(configService, 'academicYear').get(() => testMultiYearPlanStartYear);
    });
    it('should return the data in the expected format for the expected number of years', async function () {
      getStub = stub(ciService, 'getMultiYearPlan').resolves(testFourYearPlan);
      const actual = await ciController.getMultiYearPlan();
      deepStrictEqual(getStub.args, [[testFourYearPlanAcademicYears]]);
      deepStrictEqual(actual, testFourYearPlan);
    });
  });
  describe('computeAcademicYears', function () {
    beforeEach(function () {
      stub(configService, 'academicYear').get(() => testMultiYearPlanStartYear);
    });
    it('should return a 4 year list starting with the current academic year when numYears is equal to 4', function () {
      const actual = ciController.computeAcademicYears(4);
      deepStrictEqual(actual, testFourYearPlanAcademicYears);
    });
  });
  describe('/schedule', function () {
    let getStub: SinonStub;
    beforeEach(function () {
      getStub = stub(ciService, 'getCourseSchedule').resolves(testCourseScheduleData);
      stub(semesterService, 'getYearList').resolves(fakeYearList);
    });
    context('With valid semester data', function () {
      let result: ScheduleViewResponseDTO[];
      beforeEach(async function () {
        result = await ciController.getScheduleData(TERM.FALL, fakeYearList[0]);
      });
      it('Should call the service method', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('Should pass in the term and year', function () {
        const [[term, year]] = getStub.args;
        strictEqual(term, TERM.FALL);
        strictEqual(year, fakeYearList[0]);
      });
      it('Should return the value from the service', function () {
        strictEqual(result, testCourseScheduleData);
      });
    });
    context('With invalid term value', function () {
      it('Should throw an error', function () {
        return rejects(
          ciController.getScheduleData('foo' as TERM, fakeYearList[0]),
          BadRequestException
        );
      });
    });
    context('With invalid year value', function () {
      it('Should return an empty array', async function () {
        const result = await ciController
          .getScheduleData(TERM.FALL, '1920');
        deepStrictEqual(result, []);
      });
    });
  });
  describe('/room-schedule', function () {
    let getStub: SinonStub;
    const testRoomId = '32ac9171-83e9-4da9-90a3-0800c904e97c';
    beforeEach(function () {
      getStub = stub(ciService, 'getRoomSchedule').resolves(testRoomScheduleData);
      stub(semesterService, 'getYearList').resolves(fakeYearList);
    });
    context('With valid semester data', function () {
      let result: RoomScheduleResponseDTO[];
      beforeEach(async function () {
        result = await ciController.getRoomScheduleData(
          testRoomId, TERM.FALL, fakeYearList[0]
        );
      });
      it('Should call the service method', function () {
        strictEqual(getStub.callCount, 1);
      });
      it('Should pass in the term and year', function () {
        const [[, term, year]] = getStub.args;
        strictEqual(term, TERM.FALL);
        strictEqual(year, fakeYearList[0]);
      });
      it('Should return the value from the service', function () {
        strictEqual(result, testRoomScheduleData);
      });
    });
    context('With an invalid room id', function () {
      it('should throws a Not Found Error', async function () {
        const errorMessage = 'The requested room does not exist';
        mockRoomRepository.findOneOrFail.rejects(new EntityNotFoundError(Room, {
          where: { id: testRoomId },
        }));
        try {
          await ciController.getRoomScheduleData(
            testRoomId, TERM.FALL, fakeYearList[0]
          );
        } catch (e) {
          strictEqual(e instanceof NotFoundException, true);
          const error = e as NotFoundException;
          strictEqual(error.message, errorMessage);
        }
      });
    });
    context('With an invalid term value', function () {
      it('should throw an error', function () {
        return rejects(
          ciController.getRoomScheduleData(
            testRoomId, 'foo' as TERM, fakeYearList[0]
          ),
          BadRequestException
        );
      });
    });
    context('With an invalid year value', function () {
      it('should return an empty array', async function () {
        const result = await ciController
          .getRoomScheduleData(testRoomId, TERM.FALL, '1920');
        deepStrictEqual(result, []);
      });
    });
  });
});
