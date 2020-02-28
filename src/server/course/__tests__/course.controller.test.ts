import { strictEqual, deepStrictEqual, fail } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { emptyCourse, computerScienceCourse, createCourseDtoExample, string } from 'testData';
import { Authentication } from 'server/auth/authentication.guard';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Area } from 'server/area/area.entity';
import { NotFoundException } from '@nestjs/common';
import { CourseController } from '../course.controller';
import { Course } from '../course.entity';
import { CourseService } from '../course.service';

const mockCourseRepository = {
  find: stub(),
};

const mockCourseService = {
  save: stub(),
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
        {
          provide: CourseService,
          useValue: mockCourseService,
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

  describe('getAll', function () {
    it('returns all courses in the database', async function () {
      const databaseCourses = Array(10).fill(emptyCourse);

      mockCourseRepository.find.resolves(databaseCourses);

      const courses = await controller.getAll();

      strictEqual(courses.length, databaseCourses.length);
    });
  });

  describe('create', function () {
    it('creates a course', async function () {
      mockCourseService.save.resolves(computerScienceCourse);

      await controller.create(createCourseDtoExample);

      strictEqual(mockCourseService.save.callCount, 1);
      strictEqual(mockCourseService.save.args[0].length, 1);
      deepStrictEqual(
        mockCourseService.save.args[0][0],
        createCourseDtoExample
      );
    });

    it('returns the newly created course', async function () {
      mockCourseService.save.resolves(computerScienceCourse);

      const createdCourse = await controller.create(createCourseDtoExample);

      deepStrictEqual(createdCourse, computerScienceCourse);
    });
    it('throws a NotFoundException if the course area does not exist', async function () {
      mockCourseService.save.rejects(new EntityNotFoundError(Area, ''));

      try {
        await controller.create(createCourseDtoExample);
        fail('No error thrown');
      } catch (e) {
        strictEqual(e instanceof NotFoundException, true);
        strictEqual(e.response.message.includes('area'), true);
      }
    });
    it('re-throws any exceptions other than NotFoundException ', async function () {
      mockCourseService.save.rejects(new Error(string));

      try {
        await controller.create(createCourseDtoExample);
        fail('No error thrown');
      } catch (e) {
        strictEqual(e instanceof NotFoundException, false);
        strictEqual(e.message.includes('area'), false);
      }
    });
  });
});
