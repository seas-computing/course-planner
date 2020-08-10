import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  strictEqual,
  fail,
  deepStrictEqual,
} from 'assert';
import { Semester } from 'server/semester/semester.entity';
import {
  spring,
  fall,
  computerScienceCourse,
} from 'testData';
import { Area } from 'server/area/area.entity';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { CourseService } from '../course.service';
import { Course } from '../course.entity';

describe('Course service', function () {
  let mockAreaRepository: Record<string, SinonStub>;
  let mockCourseRespository : Record<string, SinonStub>;
  let mockSemesterRepository : Record<string, SinonStub>;
  let courseService: CourseService;
  beforeEach(async function () {
    mockAreaRepository = {
      findOneOrFail: stub(),
    };

    mockCourseRespository = {
      save: stub(),
    };

    mockSemesterRepository = {
      find: stub(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRespository,
        },
        {
          provide: getRepositoryToken(Semester),
          useValue: mockSemesterRepository,
        },
      ],
      controllers: [],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
  });

  describe('save', function () {
    beforeEach(function () {
      mockSemesterRepository.find.resolves([]);
    });

    it('creates a new course in the database', async function () {
      await courseService.save(computerScienceCourse);

      strictEqual(mockCourseRespository.save.callCount, 1);
    });

    it('schedules one CourseInstance per semester in the database', async function () {
      const semesters = [fall, spring];

      mockSemesterRepository.find.resolves(semesters);

      await courseService.save(computerScienceCourse);

      strictEqual(
        mockCourseRespository.save.args[0][0].instances.length,
        semesters.length
      );
    });

    it('returns the newly created course', async function () {
      mockCourseRespository.save.resolves(computerScienceCourse);

      const createdCourse = await courseService.save(computerScienceCourse);

      deepStrictEqual(createdCourse, computerScienceCourse);
    });

    it('requires that courses be created within valid areas', async function () {
      mockAreaRepository.findOneOrFail.rejects(new EntityNotFoundError(Area, ''));

      try {
        await courseService.save(computerScienceCourse);
        fail('No error thrown');
      } catch (e) {
        strictEqual(e instanceof EntityNotFoundError, true);
        strictEqual(e.message.includes('Area'), true);
        deepStrictEqual(
          mockAreaRepository.findOneOrFail.args[0][0],
          computerScienceCourse.area.id
        );
      }
    });
  });
});
