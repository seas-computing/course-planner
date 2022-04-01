import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import {
  createStubInstance,
  SinonStubbedInstance,
  SinonStub,
  stub,
} from 'sinon';
import { Test } from '@nestjs/testing';
import { SelectQueryBuilder } from 'typeorm';
import { Semester } from 'server/semester/semester.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  rawYearList,
  rawSemesterList,
} from 'testData';
import { ConfigModule } from 'server/config/config.module';
import { Authentication } from 'server/auth/authentication.guard';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { CourseInstanceService } from 'server/courseInstance/courseInstance.service';
import { Course } from 'server/course/course.entity';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { MultiYearPlanView } from 'server/courseInstance/MultiYearPlanView.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { ScheduleBlockView } from 'server/courseInstance/ScheduleBlockView.entity';
import { ScheduleEntryView } from 'server/courseInstance/ScheduleEntryView.entity';
import { CourseInstanceListingView } from 'server/courseInstance/CourseInstanceListingView.entity';
import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { NonClassParentView } from 'server/nonClassEvent/NonClassParentView.entity';
import { NonClassEventService } from 'server/nonClassEvent/nonClassEvent.service';
import { SemesterView } from '../SemesterView.entity';
import { SemesterService } from '../semester.service';
import { TestingStrategy } from '../../../../tests/mocks/authentication/testing.strategy';

describe('Semester Service', function () {
  let semesterService: SemesterService;
  let mockSemesterRepository: Record<string, SinonStub>;
  const mockRepository: Record<string, SinonStub> = {};
  let ciService: CourseInstanceService;
  let nonClassEventService: NonClassEventService;
  let mockSemesterQueryBuilder: SinonStubbedInstance<
  SelectQueryBuilder<Semester>
  >;
  const currentAcademicYear = 2022;
  const fakeYearList = [
    '2019',
    '2020',
    '2021',
    '2022',
  ];

  beforeEach(async function () {
    mockSemesterQueryBuilder = createStubInstance(SelectQueryBuilder);
    mockSemesterRepository = {};
    mockSemesterRepository.createQueryBuilder = stub()
      .returns(mockSemesterQueryBuilder);
    const testModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
      ],
      providers: [
        {
          provide: getRepositoryToken(Semester),
          useValue: mockSemesterRepository,
        },
        {
          provide: getRepositoryToken(CourseListingView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MultiYearPlanView),
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
          provide: getRepositoryToken(ScheduleBlockView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ScheduleEntryView),
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
          provide: getRepositoryToken(NonClassParent),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NonClassEvent),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(NonClassParentView),
          useValue: mockRepository,
        },
        SemesterService,
        CourseInstanceService,
        NonClassEventService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    semesterService = testModule.get<SemesterService>(SemesterService);
    ciService = testModule
      .get<CourseInstanceService>(CourseInstanceService);
    nonClassEventService = testModule
      .get<NonClassEventService>(NonClassEventService);
  });
  describe('getYearList', function () {
    context('When there are records in the database', function () {
      beforeEach(function () {
        mockSemesterQueryBuilder.select.returnsThis();
        mockSemesterQueryBuilder.distinct.returnsThis();
        mockSemesterQueryBuilder.orderBy.returnsThis();
        mockSemesterQueryBuilder.getRawMany.resolves(rawYearList);
      });
      it('returns a list of just the years', async function () {
        const result = await semesterService.getYearList();
        strictEqual(result.length, rawYearList.length);
        deepStrictEqual(result, ['2018', '2019', '2020', '2021']);
      });
    });
    context('When there are no records in the database', function () {
      beforeEach(function () {
        mockSemesterQueryBuilder.select.returnsThis();
        mockSemesterQueryBuilder.distinct.returnsThis();
        mockSemesterQueryBuilder.orderBy.returnsThis();
        mockSemesterQueryBuilder.getRawMany.resolves([]);
      });
      it('returns an empty array', async function () {
        const result = await semesterService.getYearList();
        strictEqual(result.length, 0);
        deepStrictEqual(result, []);
      });
    });
  });
  describe('getSemesterList', function () {
    context('When there are records in the database', function () {
      beforeEach(function () {
        mockSemesterQueryBuilder.select.returnsThis();
        mockSemesterQueryBuilder.addSelect.returnsThis();
        mockSemesterQueryBuilder.distinct.returnsThis();
        mockSemesterQueryBuilder.orderBy.returnsThis();
        mockSemesterQueryBuilder.addOrderBy.returnsThis();
        mockSemesterQueryBuilder.getRawMany.resolves(rawSemesterList);
      });
      it('returns a list of the terms and years of existing semesters', async function () {
        const result = await semesterService.getSemesterList();
        strictEqual(result.length, rawSemesterList.length);
        deepStrictEqual(
          result,
          rawSemesterList.map(({ term, year }): string => `${term} ${year}`)
        );
      });
    });
    context('When there are no records in the database', function () {
      beforeEach(function () {
        mockSemesterQueryBuilder.select.returnsThis();
        mockSemesterQueryBuilder.addSelect.returnsThis();
        mockSemesterQueryBuilder.distinct.returnsThis();
        mockSemesterQueryBuilder.orderBy.returnsThis();
        mockSemesterQueryBuilder.addOrderBy.returnsThis();
        mockSemesterQueryBuilder.getRawMany.resolves([]);
      });
      it('returns an empty array', async function () {
        const result = await semesterService.getSemesterList();
        strictEqual(result.length, 0);
        deepStrictEqual(result, []);
      });
    });
  });
});
