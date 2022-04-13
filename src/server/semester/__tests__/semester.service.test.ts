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
import FakeTimers from '@sinonjs/fake-timers';
import { MONTH } from 'common/constants/month';
import * as dummy from 'testData';
import { SemesterService } from '../semester.service';
import { TestingStrategy } from '../../../../tests/mocks/authentication/testing.strategy';

describe('Semester Service', function () {
  let semesterService: SemesterService;
  let mockSemesterRepository: Record<string, SinonStub>;
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
        SemesterService,
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
    let clock: FakeTimers.InstalledClock;
    let getStub: SinonStub;
    const testAcademicYear = parseInt(fakeYearList.slice(-1)[0], 10);
    const newAcademicYear = (parseInt(fakeYearList.slice(-1)[0], 10) + 1)
      .toString();
    context('before June 1st', function () {
      beforeEach(function () {
        clock = FakeTimers.install();
        clock.setSystemTime(new Date(testAcademicYear, MONTH.FEB, 20, 0, 0, 0));
      });
      after(function () {
        clock.uninstall();
      });
      it('does not create new instances', async function () {
        await semesterService.addAcademicYear();
        strictEqual(mockSemesterRepository.findOneOrFail.callCount, 0);
        strictEqual(mockSemesterRepository.save.callCount, 0);
      });
    });
    context('on June 1st', function () {
      beforeEach(function () {
        clock = FakeTimers.install();
        clock.setSystemTime(new Date(testAcademicYear, MONTH.JUN, 1, 0, 0, 0));
      });
      after(function () {
        clock.uninstall();
      });
      context('when the instances for the next year already exist', function () {
        beforeEach(function () {
          getStub = stub(semesterService, 'getYearList')
            .resolves(fakeYearList.concat(newAcademicYear));
        });
        afterEach(function () {
          getStub.restore();
        });
        it('does not create new instances', async function () {
          await semesterService.addAcademicYear();
          strictEqual(mockSemesterRepository.findOneOrFail.callCount, 0);
          strictEqual(mockSemesterRepository.save.callCount, 0);
        });
      });
      context('when the instances for the next year do not yet exist', function () {
        beforeEach(function () {
          getStub = stub(semesterService, 'getYearList').resolves(fakeYearList);
          mockSemesterRepository.findOneOrFail.onCall(0).resolves(dummy.fall);
          mockSemesterRepository.save.onCall(0).resolves(dummy.fall);
          mockSemesterRepository.findOneOrFail.onCall(1).resolves(dummy.spring);
          mockSemesterRepository.save.onCall(1).resolves(dummy.spring);
        });
        afterEach(function () {
          getStub.restore();
        });
        it('calls findOneOrFail and save', async function () {
          await semesterService.addAcademicYear();
          strictEqual(mockSemesterRepository.findOneOrFail.callCount, 2, 'Called "findOneOrFail" an unexpected number of times.');
          strictEqual(mockSemesterRepository.save.callCount, 2, 'Called "save" an unexpected number of times.');
        });
      });
    });
    context('in June after June 1st', function () {
      beforeEach(function () {
        clock = FakeTimers.install();
        clock.setSystemTime(new Date(testAcademicYear, MONTH.JUN, 8, 0, 0, 0));
      });
      after(function () {
        clock.uninstall();
      });
      context('when the instances for the next year already exist', function () {
        beforeEach(function () {
          getStub = stub(semesterService, 'getYearList')
            .resolves(fakeYearList.concat(newAcademicYear));
        });
        afterEach(function () {
          getStub.restore();
        });
        it('does not create new instances', async function () {
          await semesterService.addAcademicYear();
          strictEqual(mockSemesterRepository.findOneOrFail.callCount, 0);
          strictEqual(mockSemesterRepository.save.callCount, 0);
        });
      });
      context('when the instances for the next year do not yet exist', function () {
        beforeEach(function () {
          getStub = stub(semesterService, 'getYearList').resolves(fakeYearList);
          mockSemesterRepository.findOneOrFail.onCall(0).resolves(dummy.fall);
          mockSemesterRepository.save.onCall(0).resolves(dummy.fall);
          mockSemesterRepository.findOneOrFail.onCall(1).resolves(dummy.spring);
          mockSemesterRepository.save.onCall(1).resolves(dummy.spring);
        });
        afterEach(function () {
          getStub.restore();
        });
        it('calls findOneOrFail and save', async function () {
          await semesterService.addAcademicYear();
          strictEqual(mockSemesterRepository.findOneOrFail.callCount, 2, 'Called "findOneOrFail" an unexpected number of times.');
          strictEqual(mockSemesterRepository.save.callCount, 2, 'Called "save" an unexpected number of times.');
        });
      });
    });
  });
});
