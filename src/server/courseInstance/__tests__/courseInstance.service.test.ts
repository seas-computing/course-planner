import { TestingModule, Test } from '@nestjs/testing';
import {
  stub,
  SinonStub,
} from 'sinon';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  strictEqual,
  deepStrictEqual,
} from 'assert';
import { Area } from 'server/area/area.entity';
import { cs50CourseInstance } from 'testData';
import { OFFERED } from 'common/constants';
import { EntityNotFoundError } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CourseListingView } from 'server/course/CourseListingView.entity';
import { Course } from 'server/course/course.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { CourseInstance } from '../courseinstance.entity';
import { CourseInstanceService } from '../courseInstance.service';
import { MultiYearPlanView } from '../MultiYearPlanView.entity';
import { FacultyCourseInstance } from '../facultycourseinstance.entity';
import { ScheduleBlockView } from '../ScheduleBlockView.entity';

describe('Course Instance service', function () {
  const mockRepository: Record<string, SinonStub> = {};
  let mockAreaRepository: Record<string, SinonStub>;
  let mockCourseInstanceRepository: Record<string, SinonStub>;
  let courseInstanceService: CourseInstanceService;
  beforeEach(async function () {
    mockAreaRepository = {
      findOneOrFail: stub(),
    };
    mockCourseInstanceRepository = {
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
          useValue: mockCourseInstanceRepository,
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
          provide: getRepositoryToken(Area),
          useValue: mockAreaRepository,
        },
        CourseInstanceService,
      ],
      controllers: [],
    }).compile();

    courseInstanceService = module
      .get<CourseInstanceService>(CourseInstanceService);
  });
  describe('editCourseInstance', function () {
    context('when the area exists', function () {
      const newSpringOfferedValue = OFFERED.N;
      const expectedInstance = {
        ...cs50CourseInstance,
        spring: {
          id: cs50CourseInstance.spring.id,
          calendarYear: cs50CourseInstance.spring.calendarYear,
          offered: newSpringOfferedValue,
          preEnrollment: cs50CourseInstance.spring.preEnrollment,
          studyCardEnrollment: cs50CourseInstance.spring
            .studyCardEnrollment,
          actualEnrollment: cs50CourseInstance.spring.actualEnrollment,
          instructors: cs50CourseInstance.spring.instructors,
          meetings: cs50CourseInstance.spring.meetings,
        },
      };
      beforeEach(function () {
        mockAreaRepository
          .findOneOrFail
          .resolves(cs50CourseInstance.area);
        mockCourseInstanceRepository.findOneOrFail.resolves(cs50CourseInstance);
        mockCourseInstanceRepository.save.resolves(expectedInstance);
      });
      it('returns the updated course instance', async function () {
        const result = await courseInstanceService.editCourseInstance(
          cs50CourseInstance.id, expectedInstance
        );
        deepStrictEqual(result, expectedInstance);
      });
    });
    context('when area does not exist', function () {
      beforeEach(function () {
        mockAreaRepository.findOneOrFail.rejects(new EntityNotFoundError(Area, {
          where: { name: 'fakeArea' },
        }));
      });
      it('throws a Not Found Error', async function () {
        try {
          await courseInstanceService
            .editCourseInstance(cs50CourseInstance.id, cs50CourseInstance);
        } catch (e) {
          strictEqual(e instanceof NotFoundException, true);
        }
      });
    });
  });
});
