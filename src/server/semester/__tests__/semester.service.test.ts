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
import * as dummy from 'testData';
import { LogService } from 'server/log/log.service';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { Absence } from 'server/absence/absence.entity';
import { TestingStrategy } from '../../../../tests/mocks/authentication/testing.strategy';
import { SemesterService } from '../semester.service';

describe('Semester Service', function () {
  let semesterService: SemesterService;
  let mockSemesterRepository: Record<string, SinonStub>;
  let mockCourseInstanceRepository: Record<string, SinonStub>;
  let mockNonClassEventRepository: Record<string, SinonStub>;
  let mockAbsenceRepository: Record<string, SinonStub>;
  let mockSemesterQueryBuilder: SinonStubbedInstance<
  SelectQueryBuilder<Semester>
  >;
  const fakeYearList = [
    '2018',
    '2019',
    '2020',
  ];

  beforeEach(async function () {
    mockSemesterQueryBuilder = createStubInstance(SelectQueryBuilder);
    mockSemesterRepository = {
      findOneOrFail: stub(),
      save: stub(),
    };
    mockCourseInstanceRepository = {
      find: stub(),
    };
    mockNonClassEventRepository = {
      find: stub(),
    };
    mockAbsenceRepository = {
      find: stub(),
    };
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
          provide: getRepositoryToken(CourseInstance),
          useValue: mockCourseInstanceRepository,
        },
        {
          provide: getRepositoryToken(NonClassEvent),
          useValue: mockNonClassEventRepository,
        },
        {
          provide: getRepositoryToken(Absence),
          useValue: mockAbsenceRepository,
        },
        SemesterService,
        LogService,
      ],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    semesterService = testModule.get<SemesterService>(SemesterService);
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
  describe('addAcademicYear', function () {
    let getStub: SinonStub;
    context('when the academic year preceding the requested academic year exists', function () {
      const newAcademicYear = parseInt(fakeYearList.slice(-1)[0], 10) + 1;
      beforeEach(function () {
        getStub = stub(semesterService, 'getYearList').resolves(fakeYearList);
        mockSemesterRepository.findOneOrFail.resolves(dummy.spring);
        mockSemesterRepository.save.resolves(dummy.spring);
        mockCourseInstanceRepository.find
          .resolves([dummy.ac209aCourseInstance, dummy.cs50CourseInstance]);
        mockNonClassEventRepository.find.resolves([]);
        mockAbsenceRepository.find.resolves([]);
      });
      afterEach(function () {
        getStub.restore();
      });
      it('calls findOneOrFail once', async function () {
        await semesterService.addAcademicYear(newAcademicYear);
        strictEqual(mockSemesterRepository.findOneOrFail.callCount, 1, 'Called "findOneOrFail" an unexpected number of times.');
      });
      it('calls save once', async function () {
        await semesterService.addAcademicYear(newAcademicYear);
        strictEqual(mockSemesterRepository.save.callCount, 1, 'Called "save" an unexpected number of times.');
      });
    });
    context('when the academic year preceding the requested academic year does not exist', function () {
      const newAcademicYear = 2030;
      beforeEach(function () {
        getStub = stub(semesterService, 'getYearList').resolves(fakeYearList);
      });
      afterEach(function () {
        getStub.restore();
      });
      it('throws an error', async function () {
        try {
          await semesterService.addAcademicYear(newAcademicYear);
        } catch (e) {
          const error = e as Error;
          strictEqual(e instanceof Error, true);
          strictEqual(error.toString().includes('Error: Cannot create requested academic year until preceding academic year is created.'), true);
        }
      });
    });
  });
});
