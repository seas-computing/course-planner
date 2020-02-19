import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { strictEqual } from 'assert';
import { Semester, TERM } from 'server/semester/semester.entity';
import { CourseService } from '../course.service';
import { Course } from '../course.entity';

const mockCourseRespository = {
  insert: stub(),
};

const mockSemesterRepository = {
  find: stub(),
};

describe('Course service', function () {
  let courseService: CourseService;
  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
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
  afterEach(function () {
    Object.values({
      ...mockCourseRespository,
      ...mockSemesterRepository,
    }).forEach((sinonStub: SinonStub): void => {
      sinonStub.reset();
    });
  });

  describe('insert', function () {
    beforeEach(function () {
      mockSemesterRepository.find.resolves([]);
    });

    it('creates one new course for every object provided', async function () {
      const coursesToCreate: Course[] = [
        new Course(),
        new Course(),
      ];

      await courseService.insert(coursesToCreate);

      strictEqual(
        mockCourseRespository.insert.args[0][0].length,
        coursesToCreate.length
      );
    });

    it('schedules one CourseInstance per semester in the database', async function () {
      const semesters: Semester[] = [
        {
          term: TERM.SPRING,
          academicYear: 2020,
        } as Semester,
        {
          term: TERM.FALL,
          academicYear: 2020,
        } as Semester,
      ];

      mockSemesterRepository.find.resolves(semesters);

      await courseService.insert([new Course()]);

      strictEqual(
        mockCourseRespository.insert.args[0][0][0].instances.length,
        2
      );
    });
  });
});
