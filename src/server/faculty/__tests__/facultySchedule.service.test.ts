import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { deepStrictEqual } from 'assert';
import { Faculty } from '../faculty.entity';
import { FacultyScheduleService } from '../facultySchedule.service';
import { FacultyScheduleView } from '../FacultyScheduleView.entity';

const mockQueryBuilder = {
  leftJoinAndMapOne: stub().returnsThis(),
  leftJoinAndMapMany: stub().returnsThis(),
  orderBy: stub().returnsThis(),
  addOrderBy: stub().returnsThis(),
  getMany: stub(),
};

const mockFacultyRepository = {
  createQueryBuilder: stub().returns(mockQueryBuilder),
};

const mockRepository: Record<string, SinonStub> = {};

describe('Faculty schedule service', function () {
  let facultyScheduleService: FacultyScheduleService;

  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(FacultyScheduleView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
        FacultyScheduleService,
      ],
    }).compile();
    facultyScheduleService = module
      .get<FacultyScheduleService>(FacultyScheduleService);
  });

  afterEach(function () {
    Object.values({
      ...mockQueryBuilder,
    })
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });

  describe('getAllByYear', function () {
    context('when passed no years (an empty array)', function () {
      it('returns data for no years (an empty object)', async function () {
        const results = await facultyScheduleService.getAllByYear([]);
        deepStrictEqual(results, {});
      });
    });
  });
});
