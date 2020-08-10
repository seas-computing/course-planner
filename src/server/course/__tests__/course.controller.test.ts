import { strictEqual, deepStrictEqual, rejects } from 'assert';
import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
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
  let mockCourseService: Record<string, SinonStub>;

  beforeEach(async function () {
    mockCourseRepository = {
      find: stub(),
      findOneOrFail: stub(),
      save: stub(),
    };

    mockCourseService = {
      save: stub(),
    };

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

  describe('getAll', function () {
    it('returns all courses in the database', async function () {
      const databaseCourses = Array(10).fill(dummy.emptyCourse);

      mockCourseRepository.find.resolves(databaseCourses);

      const courses = await controller.getAll();

      strictEqual(courses.length, databaseCourses.length);
    });
  });

  describe('create', function () {
    it('creates a course', async function () {
      mockCourseService.save.resolves(dummy.computerScienceCourse);

      await controller.create(dummy.createCourseDtoExample);

      strictEqual(mockCourseService.save.callCount, 1);
      strictEqual(mockCourseService.save.args[0].length, 1);
      deepStrictEqual(
        mockCourseService.save.args[0][0],
        dummy.createCourseDtoExample
      );
    });
    it('returns the newly created course', async function () {
      mockCourseService.save.resolves(dummy.computerScienceCourse);

      const createdCourse = await controller.create(
        dummy.createCourseDtoExample
      );

      deepStrictEqual(createdCourse, dummy.computerScienceCourseResponse);
    });
    it('throws a NotFoundException if the course area does not exist', async function () {
      mockCourseService.save.rejects(new EntityNotFoundError(Area, ''));
      await rejects(
        () => controller.create(dummy.createCourseDtoExample),
        /Unable to find course area in database/
      );
    });
    it('re-throws any exceptions other than EntityNotFoundError ', async function () {
      mockCourseService.save.rejects(dummy.error);

      await rejects(
        () => controller.create(dummy.createCourseDtoExample),
        dummy.error
      );
    });
  });

  describe('update', function () {
    it('updates a course in the database', async function () {
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves(dummy.computerScienceCourse);

      await controller.update(
        dummy.computerScienceCourse.id,
        dummy.updateCourseExample
      );

      strictEqual(mockCourseRepository.save.callCount, 1);
      deepStrictEqual(
        mockCourseRepository.save.args[0][0],
        { ...dummy.computerScienceCourse }
      );
    });
    it('updates the course specified', async function () {
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves(dummy.computerScienceCourse);

      await controller.update(
        dummy.computerScienceCourse.id,
        dummy.updateCourseExample
      );

      await controller.update(computerScienceCourse.id, updateCourseExample);

      deepStrictEqual(
        mockCourseRepository.save.args[0][0].id,
        computerScienceCourse.id
      );
    });
    it('throws a NotFoundException if the course being udpated doesn\'t exist', async function () {
      mockCourseRepository.findOneOrFail.rejects(new EntityNotFoundError(Course, ''));

      await rejects(
        () => controller.update(
          dummy.computerScienceCourse.id,
          dummy.updateCourseExample
        ),
        NotFoundException
      );
    });
    it('re-throws any exceptions other than EntityNotFoundError', async function () {
      mockCourseRepository.findOneOrFail.rejects(dummy.error);

      await rejects(
        () => controller.update(
          dummy.computerScienceCourse.id,
          dummy.updateCourseExample
        ),
        Error
      );
    });
    it('returns the updated course', async function () {
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves(dummy.computerScienceCourse);

      const course = await controller.update(
        dummy.computerScienceCourse.id,
        dummy.updateCourseExample
      );

      deepStrictEqual(course, dummy.computerScienceCourseResponse);
    });
    it('allows a partial record update', async function () {
      mockCourseRepository.findOneOrFail.resolves();
      mockCourseRepository.save.resolves({
        ...dummy.computerScienceCourse,
        title: dummy.safeString,
      });

      const { title } = await controller.update(
        dummy.computerScienceCourse.id,
        { title: dummy.safeString }
      );

      deepStrictEqual(title, dummy.safeString);
    });
  });
});
