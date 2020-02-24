import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { strictEqual } from 'assert';
import { Semester } from 'server/semester/semester.entity';
import { emptyCourse, spring, fall } from 'testData';
import { CourseService } from '../course.service';
import { Course } from '../course.entity';

const mockCourseRespository = {
  save: stub(),
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

  describe('save', function () {
    beforeEach(function () {
      mockSemesterRepository.find.resolves([]);
    });

    it('creates one new course for every object provided', async function () {
      const coursesToCreate = [emptyCourse, emptyCourse];

      await courseService.save(coursesToCreate);

      strictEqual(
        mockCourseRespository.save.args[0][0].length,
        coursesToCreate.length
      );
    });

    it('schedules one CourseInstance per semester in the database', async function () {
      const semesters = [fall, spring];

      mockSemesterRepository.find.resolves(semesters);

      await courseService.save([emptyCourse]);

      strictEqual(
        mockCourseRespository.save.args[0][0][0].instances.length,
        2
      );
    });

    it('returns the newly created courses', async function () {
      const newCourses = [emptyCourse];

      mockCourseRespository.save.resolves(newCourses);

      const createdCourses = await courseService.save(newCourses);

      strictEqual(newCourses.length, createdCourses.length);
    });
  });
});
