import { Test, TestingModule } from '@nestjs/testing';
import React from 'react';
import {
  stub, SinonStub,
} from 'sinon';
import {
  render,
  RenderResult,
  fireEvent,
  within,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { SessionModule } from 'nestjs-session';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import request from 'client/api/request';
import { Repository, Not, IsNull } from 'typeorm';
import { SemesterModule } from 'server/semester/semester.module';
import { Course } from 'server/course/course.entity';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { Faculty } from 'server/faculty/faculty.entity';
import { strictEqual } from 'assert';
import mockAdapter from '../../mocks/api/adapter';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import {
  AUTH_MODE, TERM_PATTERN,
} from '../../../src/common/constants';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { CourseModule } from '../../../src/server/course/course.module';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { MetadataModule } from '../../../src/server/metadata/metadata.module';
import { FacultyModule } from '../../../src/server/faculty/faculty.module';
import { CourseInstanceModule } from '../../../src/server/courseInstance/courseInstance.module';
import { UserController } from '../../../src/server/user/user.controller';
import { LogModule } from '../../../src/server/log/log.module';

describe('End-to-end Faculty Schedule Page', function () {
  let testModule: TestingModule;
  let authStub: SinonStub;
  let courseRepository: Repository<Course>;
  let fciRepository: Repository<FacultyCourseInstance>;
  const currentAcademicYear = 2019;
  let renderResult: RenderResult;

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
    const fakeConfig = new ConfigService(this.database.connectionEnv);
    // Stub out the academicYear getter to lock us to a known year. Otherwise,
    // tests might fail in the future if our test data don't include that year.
    stub(fakeConfig, 'academicYear').get(() => currentAcademicYear);
    stub(fakeConfig, 'logLevel').get(() => 'error');
    testModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: dummy.safeString,
            resave: true,
            saveUninitialized: true,
          },
        }),
        ConfigModule,
        LogModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (
            config: ConfigService
          ): TypeOrmModuleOptions => ({
            ...config.dbOptions,
            synchronize: true,
            autoLoadEntities: true,
            retryAttempts: 10,
            retryDelay: 10000,
          }),
          inject: [ConfigService],
        }),
        AuthModule.register({
          strategies: [TestingStrategy],
          defaultStrategy: AUTH_MODE.TEST,
        }),
        PopulationModule,
        CourseModule,
        FacultyModule,
        CourseInstanceModule,
        MetadataModule,
        SemesterModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    courseRepository = testModule.get(
      getRepositoryToken(Course)
    );
    fciRepository = testModule.get(
      getRepositoryToken(FacultyCourseInstance)
    );
    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    const api = nestApp.getHttpServer();
    request.defaults.adapter = mockAdapter(api);
    authStub.resolves(dummy.adminUser);
  });
  afterEach(async function () {
    return testModule.close();
  });
  describe('Rendering Schedule Information', function () {
    let testFacultyCourseInstances: FacultyCourseInstance[];
    let courseWithSameAs: Course;
    let associatedCourses: string[];
    let associatedFaculty: Faculty[];
    beforeEach(async function () {
      courseWithSameAs = await courseRepository.findOneOrFail({
        relations: ['sameAs'],
        where: {
          sameAs: Not(IsNull()),
        },
      });
      const parentCourse = courseWithSameAs.sameAs;
      const coursesWithCommonSameAs = await courseRepository.find({
        relations: ['sameAs'],
        where: {
          sameAs: {
            title: parentCourse.title,
            prefix: parentCourse.prefix,
            number: parentCourse.number,
          },
        },
      });
      const childCourses = coursesWithCommonSameAs.map((course) => `${course.prefix} ${course.number}`);

      // Create a list of all of the associated courses
      associatedCourses = childCourses.concat(`${parentCourse.prefix} ${parentCourse.number}`);

      testFacultyCourseInstances = await fciRepository.find({
        relations: ['courseInstance', 'courseInstance.course', 'courseInstance.course.area', 'courseInstance.semester', 'faculty'],
        where: {
          courseInstance: {
            course: {
              prefix: parentCourse.prefix,
              number: parentCourse.number,
            },
            semester: {
              academicYear: currentAcademicYear,
            },
          },
        },
      });

      // Get all of the faculty related to the associated courses
      associatedFaculty = testFacultyCourseInstances
        .map((instance) => instance.faculty);

      renderResult = render(
        <MemoryRouter initialEntries={['/faculty']}>
          <App />
        </MemoryRouter>
      );
    });
    context('when a course has a sameAs relationship with another', function () {
      it('should display the related courses for that faculty entry', async function () {
        await renderResult.findAllByText(associatedCourses[0]);

        // Filter the rows by the associated faculty
        const rows = renderResult.getAllByRole('row');
        const utils = within(rows[2]);
        const lastNameField = utils.queryByLabelText('Change to filter the faculty list by last name');
        const firstNameField = utils.queryByLabelText('Change to filter the faculty list by first name');

        // Check that for each of the faculty rows that the appropriate course
        // information is displayed.
        associatedFaculty.forEach((faculty) => {
          fireEvent.change(lastNameField,
            { target: { value: faculty.lastName } });
          fireEvent.change(firstNameField,
            { target: { value: faculty.firstName } });

          // Check the content of the faculty row
          const parentRow = Array.from(renderResult.getAllByRole('row'))[3] as HTMLTableRowElement;
          const parentRowContent = (Array.from(parentRow.cells)
            .map((cell) => cell.textContent));

          // Make sure for that the term that the tested course occurs in that
          // the associated "same as" courses are displayed.
          const courseTerm = courseWithSameAs.termPattern;
          if (courseTerm === TERM_PATTERN.FALL) {
            associatedCourses.forEach((course) => {
              // An index of 6 corresponds to the fall courses column
              strictEqual(parentRowContent[6].includes(course), true, `${course} was expected in the cell but was not found`);
            });
          } else if (courseTerm === TERM_PATTERN.SPRING) {
            associatedCourses.forEach((course) => {
              // An index of 8 corresponds to the spring courses column
              strictEqual(parentRowContent[8].includes(course), true, `${course} was expected in the cell but was not found`);
            });
          } else { // When the term pattern is TERM_PATTERN.BOTH
            associatedCourses.forEach((course) => {
              strictEqual(parentRowContent[6].includes(course), true, `${course} was expected in the cell but was not found`);
              strictEqual(parentRowContent[8].includes(course), true, `${course} was expected in the cell but was not found`);
            });
          }
        });
      });
    });
  });
});
