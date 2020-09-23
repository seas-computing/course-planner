import { TestingModule, Test } from '@nestjs/testing';
import {
  stub,
  SinonStub,
  createStubInstance,
  SinonStubbedInstance,
} from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  strictEqual,
  deepStrictEqual,
  rejects,
} from 'assert';
import { Semester } from 'server/semester/semester.entity';
import {
  spring,
  fall,
  computerScienceCourseQueryResult,
  physicsCourseQueryResult,
  computerScienceCourse,
  computerScienceCourseResponse,
  physicsCourseResponse,
} from 'testData';
import { Area } from 'server/area/area.entity';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { SelectQueryBuilder } from 'typeorm';
import { CourseService } from '../course.service';
import { Course } from '../course.entity';

describe('Course service', function () {
  let mockAreaRepository: Record<string, SinonStub>;
  let mockCourseRepository : Record<string, SinonStub>;
  let mockSemesterRepository : Record<string, SinonStub>;
  let courseService: CourseService;
  let mockCourseQueryBuilder: SinonStubbedInstance<SelectQueryBuilder<Course>>;
  beforeEach(async function () {
    mockCourseQueryBuilder = createStubInstance(SelectQueryBuilder);
    mockCourseQueryBuilder.select.returnsThis();
    mockCourseQueryBuilder.addSelect.returnsThis();
    mockCourseQueryBuilder.leftJoinAndSelect.returnsThis();
    mockCourseQueryBuilder.orderBy.returnsThis();
    mockCourseQueryBuilder.addOrderBy.returnsThis();
    mockCourseQueryBuilder.getRawMany.resolves([
      computerScienceCourseQueryResult,
      physicsCourseQueryResult,
    ]);
    mockAreaRepository = {
      findOneOrFail: stub(),
    };

    mockCourseRepository = {
      createQueryBuilder: stub().returns(mockCourseQueryBuilder),
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
          useValue: mockCourseRepository,
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
  describe('findCourses', function () {
    it('returns all courses from the database', async function () {
      const results = await courseService.findCourses();
      deepStrictEqual(
        results,
        [computerScienceCourseResponse, physicsCourseResponse]
      );
    });
  });
  describe('save', function () {
    beforeEach(function () {
      mockSemesterRepository.find.resolves([]);
    });

    it('creates a new course in the database', async function () {
      await courseService.save(computerScienceCourse);

      strictEqual(mockCourseRepository.save.callCount, 1);
    });

    it('schedules one CourseInstance per semester in the database', async function () {
      const semesters = [fall, spring];

      mockSemesterRepository.find.resolves(semesters);

      await courseService.save(computerScienceCourse);

      const updatedCourse = mockCourseRepository.save.args[0][0] as Course;

      strictEqual(
        updatedCourse.instances.length,
        semesters.length
      );
    });

    it('returns the newly created course', async function () {
      mockCourseRepository.save.resolves(computerScienceCourse);

      const createdCourse = await courseService.save(computerScienceCourse);

      deepStrictEqual(createdCourse, computerScienceCourse);
    });

    it('requires that courses be created within valid areas', async function () {
      mockAreaRepository.findOneOrFail.rejects(new EntityNotFoundError(Area, ''));

      await rejects(() => courseService.save(computerScienceCourse), /Area/);
    });
  });
});
