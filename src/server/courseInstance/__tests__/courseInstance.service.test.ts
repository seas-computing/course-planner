import { TestingModule, Test } from '@nestjs/testing';
import {
  stub,
  SinonStub,
} from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import { deepStrictEqual } from 'assert';
import { cs50CourseInstance, cs50FallInstanceUpdate } from 'testData';
import { OFFERED } from 'common/constants';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { Course } from 'server/course/course.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { CourseInstance } from '../courseinstance.entity';
import { CourseInstanceService } from '../courseInstance.service';
import { MultiYearPlanView } from '../MultiYearPlanView.entity';
import { FacultyCourseInstance } from '../facultycourseinstance.entity';
import { ScheduleBlockView } from '../ScheduleBlockView.entity';
import { CourseInstanceListingView } from '../CourseInstanceListingView.entity';

describe('Course Instance service', function () {
  const mockRepository: Record<string, SinonStub> = {};
  let mockInstanceRepository: Record<string, SinonStub>;
  let courseInstanceService: CourseInstanceService;
  beforeEach(async function () {
    mockInstanceRepository = {
      findOneOrFail: stub(),
      save: stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(CourseListingView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(MultiYearPlanView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Course),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CourseInstance),
          useValue: mockInstanceRepository,
        },
        {
          provide: getRepositoryToken(Faculty),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(FacultyCourseInstance),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(ScheduleBlockView),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(CourseInstanceListingView),
          useValue: mockRepository,
        },
        CourseInstanceService,
      ],
      controllers: [],
    }).compile();

    courseInstanceService = module
      .get<CourseInstanceService>(CourseInstanceService);
  });
  describe('editCourseInstance', function () {
    const newOfferedValue = OFFERED.N;
    const expectedResponse = {
      ...cs50FallInstanceUpdate,
      offered: newOfferedValue,
    };
    beforeEach(function () {
      mockInstanceRepository
        .findOneOrFail.resolves(cs50CourseInstance);
      mockInstanceRepository.save.resolves(expectedResponse);
    });
    it('returns the updated instance', async function () {
      const result = await courseInstanceService.editCourseInstance(
        cs50CourseInstance.id, {
          ...cs50FallInstanceUpdate,
          offered: newOfferedValue,
        }
      );
      deepStrictEqual(result, expectedResponse);
    });
  });
});
