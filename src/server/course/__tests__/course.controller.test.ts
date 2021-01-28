import { strictEqual, deepStrictEqual, rejects } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  emptyCourse,
  computerScienceCourse,
  createCourseDtoExample,
  computerScienceCourseResponse,
  updateCourseExample,
  error,
} from 'testData';
import { Authentication } from 'server/auth/authentication.guard';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { Area } from 'server/area/area.entity';
import { NotFoundException } from '@nestjs/common';
import { CourseController } from '../course.controller';
import { Course } from '../course.entity';
import { CourseService } from '../course.service';

describe('Course controller', function () {
  let controller: CourseController;
  let mockCourseRepository: Record<string, SinonStub>;
  let mockAreaRepository: Record<string, SinonStub>;
  let mockCourseService: Record<string, SinonStub>;

  beforeEach(async function () {
    mockAreaRepository = {
      findOne: stub(),
    };

    mockCourseRepository = {
      find: stub(),
      findOneOrFail: stub(),
      save: stub(),
    };

    mockCourseService = {
      save: stub(),
      findCourses: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Course),
          useValue: mockCourseRepository,
        },
        {
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
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

  describe('getAll', function () {
    it('returns all courses in the database', async function () {
      const databaseCourses = Array(10).fill(emptyCourse);

      mockCourseService.findCourses.resolves(databaseCourses);

      const courses = await controller.getAll();

      strictEqual(mockCourseService.findCourses.callCount, 1);
      strictEqual(mockCourseService.findCourses.args[0].length, 0);
      deepStrictEqual(courses, databaseCourses);
    });
  });

  describe('create', function () {
    it('creates a course', async function () {
      mockAreaRepository.findOne.resolves(createCourseDtoExample.area);
      mockCourseService.save.resolves(computerScienceCourseResponse);

      await controller.create(createCourseDtoExample);

      strictEqual(mockCourseService.save.callCount, 1);
      strictEqual(mockCourseService.save.args[0].length, 1);
      deepStrictEqual(
        mockCourseService.save.args[0][0],
        createCourseDtoExample
      );
    });
    it('returns the newly created course', async function () {
      mockAreaRepository.findOne.resolves(createCourseDtoExample.area);
      mockCourseService.save.resolves(computerScienceCourse);

      const createdCourse = await controller.create(
        createCourseDtoExample
      );

      deepStrictEqual(createdCourse, computerScienceCourseResponse);
    });
    it('re-throws any exceptions other than EntityNotFoundError ', async function () {
      mockCourseService.save.rejects(error);

      await rejects(
        () => controller.create(createCourseDtoExample),
        error
      );
    });
  });

  describe('update', function () {
    it('updates a course in the database', async function () {
      mockAreaRepository.findOne.resolves(computerScienceCourse.area);
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves(computerScienceCourse);

      await controller.update(
        computerScienceCourse.id,
        updateCourseExample
      );

      strictEqual(mockCourseRepository.save.callCount, 1);
      deepStrictEqual(
        mockCourseRepository.save.args[0][0],
        { ...computerScienceCourse }
      );
    });
    it('updates the course specified', async function () {
      mockAreaRepository.findOne.resolves(computerScienceCourse.area);
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves(computerScienceCourse);

      await controller.update(
        computerScienceCourse.id,
        updateCourseExample
      );

      const updatedCourse = mockCourseRepository.save.args[0][0] as Course;

      deepStrictEqual(
        updatedCourse.id,
        computerScienceCourse.id
      );
    });
    it('throws a NotFoundException if the course being udpated doesn\'t exist', async function () {
      mockCourseRepository.findOneOrFail.rejects(new EntityNotFoundError(Course, ''));

      await rejects(
        () => controller.update(
          computerScienceCourse.id,
          updateCourseExample
        ),
        NotFoundException
      );
    });
    it('re-throws any exceptions other than EntityNotFoundError', async function () {
      mockCourseRepository.findOneOrFail.rejects(error);

      await rejects(
        () => controller.update(
          computerScienceCourse.id,
          updateCourseExample
        ),
        Error
      );
    });
    it('returns the updated course', async function () {
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves(computerScienceCourse);

      const course = await controller.update(
        computerScienceCourse.id,
        updateCourseExample
      );

      deepStrictEqual(course, computerScienceCourseResponse);
    });
  });
});
