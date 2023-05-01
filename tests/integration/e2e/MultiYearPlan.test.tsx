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
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { SessionModule } from 'nestjs-session';
import { MemoryRouter } from 'react-router-dom';
import App from 'client/components/App';
import request from 'client/api/request';
import { Repository, Not } from 'typeorm';
import {
  strictEqual,
} from 'assert';
import { SemesterModule } from 'server/semester/semester.module';
import { FacultyCourseInstance } from 'server/courseInstance/facultycourseinstance.entity';
import { CourseInstance } from 'server/courseInstance/courseinstance.entity';
import { Semester } from 'server/semester/semester.entity';
import mockAdapter from '../../mocks/api/adapter';
import { ConfigModule } from '../../../src/server/config/config.module';
import { ConfigService } from '../../../src/server/config/config.service';
import { AuthModule } from '../../../src/server/auth/auth.module';
import { TestingStrategy } from '../../mocks/authentication/testing.strategy';
import {
  AUTH_MODE, OFFERED, TERM, TERM_PATTERN,
} from '../../../src/common/constants';
import { PopulationModule } from '../../mocks/database/population/population.module';
import { CourseModule } from '../../../src/server/course/course.module';
import { BadRequestExceptionPipe } from '../../../src/server/utils/BadRequestExceptionPipe';
import { MetadataModule } from '../../../src/server/metadata/metadata.module';
import { FacultyModule } from '../../../src/server/faculty/faculty.module';
import { CourseInstanceModule } from '../../../src/server/courseInstance/courseInstance.module';
import { UserController } from '../../../src/server/user/user.controller';
import { Course } from '../../../src/server/course/course.entity';
import { LogModule } from '../../../src/server/log/log.module';

describe('End-to-end Multi Year Plan tests', function () {
  let testModule: TestingModule;
  let authStub: SinonStub;
  let ciRepository: Repository<CourseInstance>;
  let fciRepository: Repository<FacultyCourseInstance>;
  let semesterRepository: Repository<Semester>;
  const currentAcademicYear = 2019;
  const currentTerm = TERM.SPRING;
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
    fciRepository = testModule.get(
      getRepositoryToken(FacultyCourseInstance)
    );
    ciRepository = testModule.get(
      getRepositoryToken(CourseInstance)
    );
    semesterRepository = testModule.get(
      getRepositoryToken(Semester)
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
  describe('Rendering Instructor Information', function () {
    let testSemester: Semester;
    let parentCourse: Course;
    let nonRetiredCi: CourseInstance;
    let childCourse: Course;
    let instructor: FacultyCourseInstance;
    beforeEach(async function () {
      testSemester = await semesterRepository.findOneOrFail({
        where: {
          academicYear: currentAcademicYear,
          term: currentTerm,
        },
      });
      instructor = await fciRepository.findOneOrFail({
        relations: ['courseInstance', 'courseInstance.course', 'courseInstance.semester'],
        where: {
          courseInstance: {
            offered: Not(OFFERED.RETIRED),
            course: {
              // sameAs should be null to ensure the parent course is not a child course
              sameAs: null,
              termPattern: TERM_PATTERN.BOTH,
            },
            semester: {
              id: testSemester.id,
              term: currentTerm,
            },
          },
        },
      });
      parentCourse = instructor.courseInstance.course;
      nonRetiredCi = await ciRepository.findOneOrFail({
        relations: ['course', 'semester'],
        where: {
          offered: Not(OFFERED.RETIRED),
          course: {
            termPattern: TERM_PATTERN.BOTH,
          },
          semester: {
            id: testSemester.id,
            term: currentTerm,
          },
        },
      });
      childCourse = nonRetiredCi.course;
      renderResult = render(
        <MemoryRouter initialEntries={['/course-admin']}>
          <App />
        </MemoryRouter>
      );
    });
    context('when a course is a child of another', function () {
      it('should display the faculty of its parent course', async function () {
        await renderResult.findByText(`${childCourse.prefix} ${childCourse.number}`, { exact: false });
        // Filter courses in the table by catalog number in case the child course's title is not unique
        let rows = renderResult.getAllByRole('row');
        let utils = within(rows[1]);
        const courseNumberField = utils.queryByLabelText('The table will be filtered as characters are typed in this course filter field');
        fireEvent.change(courseNumberField, { target: { value: `${childCourse.prefix} ${childCourse.number}` } });
        await renderResult.findByText(`${childCourse.title}`, { exact: false });
        // Edit the child course to set its parent via the sameAs field
        const editButton = await renderResult
          .findByLabelText(`Edit course information for ${childCourse.title}`,
            { exact: false });
        fireEvent.click(editButton);
        await renderResult.findByRole('dialog');
        await renderResult.findByText(childCourse.title);
        const sameAsSelect = await renderResult.findByLabelText('Same As', { exact: false }) as HTMLSelectElement;
        fireEvent.change(
          sameAsSelect,
          { target: { value: parentCourse.id } }
        );
        const submitButton = renderResult.getByText('Submit');
        fireEvent.click(submitButton);
        await waitForElementToBeRemoved(() => renderResult.getByRole('dialog'));

        // Navigate to multi year plan tab
        const multiYearPlanTab = await renderResult.findByText('4 Year Plan', { exact: false });
        fireEvent.click(multiYearPlanTab);
        await renderResult.findByText(`${childCourse.prefix} ${childCourse.number}`, { exact: false });

        // Find the instructor information across the years for the parent course
        rows = renderResult.getAllByRole('row');
        utils = within(rows[1]);
        const catalogNumberField = utils.queryByLabelText('The table will be filtered as characters are typed in this catalog number filter field');
        fireEvent.change(catalogNumberField, { target: { value: `${parentCourse.prefix} ${parentCourse.number}` } });
        const parentRow = Array.from(renderResult.getAllByRole('row'))[2] as HTMLTableRowElement;
        let parentRowContent = (Array.from(parentRow.cells)
          .map((cell) => cell.textContent));
        // Remove the course top level information and
        // take only the instructor information.
        parentRowContent = parentRowContent.slice(3);

        // Find the instructor information across the years for the child course
        fireEvent.change(catalogNumberField, { target: { value: `${childCourse.prefix} ${childCourse.number}` } });
        const childRow = Array.from(renderResult.getAllByRole('row'))[2] as HTMLTableRowElement;
        let childRowContent = (Array.from(childRow.cells)
          .map((cell) => cell.textContent));
        // Remove the top level course information and
        // take only the instructor information.
        childRowContent = childRowContent.slice(3);

        let numRowsCompared = 0;
        // Compare the faculty information and make sure they are equal
        let areRowsEqual = true;
        for (let i = 0; i < parentRowContent.length; i++) {
          if (parentRowContent[i] !== childRowContent[i]) {
            areRowsEqual = false;
          }
          numRowsCompared += 1;
        }
        strictEqual(
          numRowsCompared > 0,
          true,
          'No rows were compared, possibly because the rows are empty.'
        );
        strictEqual(areRowsEqual, true, 'Parent and child rows do not have the same content.');
      }).timeout(120000);
    });
  });
});
