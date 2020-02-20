import { TestingModule, Test } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { strictEqual } from 'assert';
import { CourseService } from '../course.service';
import { Course } from '../course.entity';

const mockCourseRespository = {
  insert: stub(),
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
      ],
      controllers: [],
    }).compile();

    courseService = module.get<CourseService>(CourseService);
  });
  afterEach(function () {
    Object.values({
      ...mockCourseRespository,
    }).forEach((sinonStub: SinonStub): void => {
      sinonStub.reset();
    });
  });

  describe('insert', function () {
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
  });
});
