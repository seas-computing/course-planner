import { deepStrictEqual, strictEqual } from 'assert';
import { stub, SinonStub } from 'sinon';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Authentication } from 'server/auth/authentication.guard';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { SemesterService } from 'server/semester/semester.service';
import { Semester } from 'server/semester/semester.entity';
import { ConfigService } from 'server/config/config.service';
import { CourseInstanceService } from '../courseInstance.service';
import { CourseInstanceController } from '../courseInstance.controller';
import { MultiYearPlanView } from '../MultiYearPlanView.entity';

describe('Course Instance Controller', function () {
  let ciController: CourseInstanceController;
  let ciService: CourseInstanceService;
  let semesterService: SemesterService;
  let configService: ConfigService;
  const mockRepository: Record<string, SinonStub> = {};
  const fakeYearList = [
    '2018',
    '2019',
    '2020',
    '2021',
  ];
  beforeEach(async function () {
    const testModule = await Test.createTestingModule({
      controllers: [CourseInstanceController],
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
        ConfigService,
        CourseInstanceService,
        SemesterService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
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
        it('Should call the service once for every year in the db', async function () {
          await ciController.getInstances();
          strictEqual(getStub.callCount, fakeYearList.length);
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
      context('With multiple valid acadYears', function () {
        it('Should call the service once for each year passed', async function () {
          const yearArgs = ['2018', '2020'];
          await ciController.getInstances(yearArgs.join(','));
          strictEqual(getStub.callCount, yearArgs.length);
        });
        it('Should call the years in lexigraphical order', async function () {
          const yearArgs = ['2020', '2019', '2018'];
          await ciController.getInstances(yearArgs.join(','));
          strictEqual(getStub.callCount, yearArgs.length);
          strictEqual(getStub.args[0][0], 2018);
          strictEqual(getStub.args[1][0], 2019);
          strictEqual(getStub.args[2][0], 2020);
        });
      });
      context('With duplicate years', function () {
        it('Should only call each year once', async function () {
          const yearArgs = ['2020', '2020', '2020', '2020'];
          await ciController.getInstances(yearArgs.join(','));
          strictEqual(getStub.callCount, 1);
        });
      });
      context('With only an invalid acadYear parameter', function () {
        it('Should not call the function for that year', async function () {
          await ciController.getInstances('1999');
          strictEqual(getStub.callCount, 0);
          strictEqual(getStub.calledWith(1999), false);
        });
      });
      context('With a mix of valid and invalid acadYear parameters', function () {
        it('Should only call the valid years', async function () {
          const validYearArgs = ['2018', '2020'];
          const invalidYearArgs = ['2049', '1949'];
          await ciController.getInstances([...validYearArgs, ...invalidYearArgs].join(','));
          strictEqual(getStub.callCount, validYearArgs.length);
          invalidYearArgs.forEach((year): void => {
            const yearArg = parseInt(year, 10);
            strictEqual(getStub.calledWith(yearArg), false);
          });
        });
      });
    });
  });
  describe('/multi-year-plan', function () {
    describe('Get all plans', function () {
      let getStub: SinonStub;
      beforeEach(function () {
        getStub = stub(ciService, 'getMultiYearPlan').resolves();
        stub(configService, 'academicYear').resolves(2020);
      });
      context('with no argument specified for number of years parameter', function () {
        it('should fetch the multi year plan with the default number of years', async function () {
          await ciController.getMultiYearPlan();
          deepStrictEqual(getStub.args, [[4]]);
        });
      });
      context('with number of years parameter set to 0', function () {
        it('should fetch the multi year plan with the default number of years', async function () {
          await ciController.getMultiYearPlan(0);
          deepStrictEqual(getStub.args, [[4]]);
        });
      });
      context('with number of years parameter set to a negative number', function () {
        it('should fetch the multi year plan with the default number of years', async function () {
          await ciController.getMultiYearPlan(-3);
          deepStrictEqual(getStub.args, [[4]]);
        });
      });
      context('with number of years parameter set to null', function () {
        it('should fetch the multi year plan with the default number of years', async function () {
          await ciController.getMultiYearPlan(null);
          deepStrictEqual(getStub.args, [[4]]);
        });
      });
      context('with number of years parameter set to undefined', function () {
        it('should fetch the multi year plan with the default number of years', async function () {
          await ciController.getMultiYearPlan(undefined);
          deepStrictEqual(getStub.args, [[4]]);
        });
      });
      context('with number of years parameter set to a float', function () {
        it('should fetch the multi year plan with the default number of years', async function () {
          await ciController.getMultiYearPlan(2.3);
          deepStrictEqual(getStub.args, [[4]]);
        });
      });
      context('with a valid argument for number of years parameter', function () {
        it('should fetch the multi year plan for the given number of years', async function () {
          await ciController.getMultiYearPlan(5);
          deepStrictEqual(getStub.args, [[5]]);
        });
      });
    });
  });
});
