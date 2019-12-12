import { strictEqual } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Area } from '../../area/area.entity';
import { CourseController } from '../course.controller';
import { Course } from '../course.entity';
import { Authentication } from '../../auth/authentication.guard';

const mockCourseRepository = {
  find: stub(),
};

describe('Course controller', function () {
  let controller: CourseController;

  beforeEach(async function () {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
      ],
      controllers: [CourseController],
    })
      .overrideGuard(Authentication)
      .useValue(true)
      .compile();

    controller = module.get<CourseController>(CourseController);
  });

  afterEach(function () {
    Object.values(mockCourseRepository)
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });

  describe('index', function () {
    it('returns all courses in the database', async function () {
      const databaseCourses = Array(10).fill({
        ...new Course(),
        area: new Area(),
      });

      mockCourseRepository.find.resolves(databaseCourses);

      const courses = await controller.getAll();

      strictEqual(courses.length, databaseCourses.length);
    });
  });
});
