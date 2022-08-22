import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { deepStrictEqual } from 'assert';
import { bioengineeringFacultyMember, appliedMathFacultyMember } from 'testData';
import { Semester } from 'server/semester/semester.entity';
import { FacultyService } from '../faculty.service';
import { Faculty } from '../faculty.entity';
import { ConfigModule } from 'server/config/config.module';
import { Absence } from 'server/absence/absence.entity';

const mockQueryBuilder = {
  leftJoinAndSelect: stub().returnsThis(),
  orderBy: stub().returnsThis(),
  addOrderBy: stub().returnsThis(),
  getMany: stub(),
};

const mockFacultyRepository = {
  createQueryBuilder: stub().returns(mockQueryBuilder),
};

describe('Faculty service', function () {
  let facultyService: FacultyService;

  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: getRepositoryToken(Absence),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Semester),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockFacultyRepository,
        },
        FacultyService,
      ],
    }).compile();
    facultyService = module.get<FacultyService>(FacultyService);
  });

  afterEach(function () {
    Object.values({
      ...mockQueryBuilder,
    })
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });

  describe('find', function () {
    it('returns all faculty from the database', async function () {
      mockQueryBuilder.getMany.resolves([
        appliedMathFacultyMember,
        bioengineeringFacultyMember,
      ]);

      const results = await facultyService.find();

      deepStrictEqual(results, [
        appliedMathFacultyMember,
        bioengineeringFacultyMember,
      ]);
    });
  });
});
