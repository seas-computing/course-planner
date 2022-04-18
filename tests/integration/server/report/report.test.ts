import { Test, TestingModule } from '@nestjs/testing';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { SessionModule } from 'nestjs-session';
import {
  stub,
} from 'sinon';
import request from 'supertest';
import {
  HttpServer, HttpStatus,
} from '@nestjs/common';
import {
  strictEqual, notStrictEqual, deepStrictEqual,
} from 'assert';
import Excel from 'exceljs';
import { AUTH_MODE } from 'common/constants';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { CourseModule } from 'server/course/course.module';
import { ConfigService } from 'server/config/config.service';
import * as dummy from 'testData';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { FacultyModule } from 'server/faculty/faculty.module';
import { LocationModule } from 'server/location/location.module';
import { MeetingModule } from 'server/meeting/meeting.module';
import { MetadataModule } from 'server/metadata/metadata.module';
import { NonClassEventModule } from 'server/nonClassEvent/nonclassevent.module';
import { ReportModule } from 'server/report/report.module';
import { UserController } from 'server/user/user.controller';
import { Repository } from 'typeorm';
import { Course } from 'server/course/course.entity';
import { SemesterService } from 'server/semester/semester.service';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('Report Controller', function () {
  let testModule: TestingModule;
  let api: HttpServer;
  let semesterService: SemesterService;
  let courseRepository: Repository<Course>;
  const currentAcademicYear = 2019;
  beforeEach(async function () {
    // Auth testing is handled separarately, so we'll just use our admin
    stub(TestingStrategy.prototype, 'login')
      .resolves(dummy.adminUser);
    const fakeConfig = new ConfigService(this.database.connectionEnv);
    stub(fakeConfig, 'academicYear').get(() => currentAcademicYear);
    testModule = await Test.createTestingModule({
      imports: [
        SessionModule.forRoot({
          session: {
            secret: dummy.string,
            resave: true,
            saveUninitialized: true,
          },
        }),
        ConfigModule,
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
        CourseInstanceModule,
        FacultyModule,
        LocationModule,
        MeetingModule,
        MetadataModule,
        NonClassEventModule,
        ReportModule,
      ],
      controllers: [
        UserController,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(fakeConfig)
      .compile();
    const nestApp = await testModule.createNestApplication().init();
    courseRepository = nestApp.get(getRepositoryToken(Course));
    semesterService = nestApp.get(SemesterService);
    api = nestApp.getHttpServer() as HttpServer;
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('/report/courses', function () {
    let testReport: Excel.Workbook;
    context('Without providing a date range', function () {
      beforeEach(async function () {
        const courseReport = await request(api).get('/report/courses');
        const courseData = courseReport.body;
        testReport = new Excel.Workbook();
        return testReport.xlsx.load(courseData);
      });
      it('Should only have a "Courses" sheet', function () {
        const worksheetNames = testReport.worksheets.map((sheet) => sheet.name);
        deepStrictEqual(worksheetNames, ['Courses']);
      });
      it('Should have a row for each course in the database', async function () {
        const courseCount = await courseRepository.count();
        const { number: rowCount } = testReport.getWorksheet('Courses').lastRow;
        // Add one for the header
        strictEqual(rowCount, courseCount + 1);
      });
      it('Should default to span the current Academic Year to the end of the database', async function () {
        const columnHeaders: string[] = [];
        testReport
          .getWorksheet('Courses')
          .getRow(1)
          .eachCell((cell) => { columnHeaders.push(cell.text); });

        const allYears = await semesterService.getYearList();
        const currentIndex = allYears
          .findIndex((year) => year === currentAcademicYear.toString());
        const yearRange = allYears.slice(currentIndex);
        const headerPairs = yearRange.reduce<string[]>(
          (pairs: string[], currentYear: string): string[] => {
            const fallYear = (parseInt(currentYear, 10) - 1);
            const fallHeader = `F'${fallYear.toString().slice(2)}`;
            const springHeader = `S'${currentYear.toString().slice(2)}`;
            return [...pairs, fallHeader, springHeader];
          }, []
        );
        headerPairs.forEach((header) => {
          const firstSemesterHeader = columnHeaders
            .findIndex((col) => col.includes(header));
          notStrictEqual(firstSemesterHeader, -1, `Header with ${header} does not appear`);
        });
      });
    });
    context('Providing only a start year', function () {
      let startYear: number;
      beforeEach(async function () {
        startYear = currentAcademicYear + 1;
        const courseReport = await request(api).get(`/report/courses?startYear=${startYear}`);
        const courseData = courseReport.body;
        testReport = new Excel.Workbook();
        return testReport.xlsx.load(courseData);
      });
      it('Should only have a "Courses" sheet', function () {
        const worksheetNames = testReport.worksheets.map((sheet) => sheet.name);
        deepStrictEqual(worksheetNames, ['Courses']);
      });
      it('Should have a row for each course in the database', async function () {
        const courseCount = await courseRepository.count();
        const { number: rowCount } = testReport.getWorksheet('Courses').lastRow;
        // Add one for the header
        strictEqual(rowCount, courseCount + 1);
      });
      it('Should cover the startYear to the end of the database ', async function () {
        const columnHeaders: string[] = [];
        testReport
          .getWorksheet('Courses')
          .getRow(1)
          .eachCell((cell) => { columnHeaders.push(cell.text); });

        const allYears = await semesterService.getYearList();
        const currentIndex = allYears
          .findIndex((year) => year === startYear.toString());
        const yearRange = allYears.slice(currentIndex);
        const headerPairs = yearRange.reduce<string[]>(
          (pairs: string[], currentYear: string): string[] => {
            const fallYear = (parseInt(currentYear, 10) - 1);
            const fallHeader = `F'${fallYear.toString().slice(2)}`;
            const springHeader = `S'${currentYear.toString().slice(2)}`;
            return [...pairs, fallHeader, springHeader];
          }, []
        );
        headerPairs.forEach((header) => {
          const firstSemesterHeader = columnHeaders
            .findIndex((col) => col.includes(header));
          notStrictEqual(firstSemesterHeader, -1, `Header with ${header} does not appear`);
        });
      });
    });
    context('Providing only an end year', function () {
      let endYear: number;
      beforeEach(async function () {
        endYear = currentAcademicYear + 1;
        const courseReport = await request(api).get(`/report/courses?endYear=${endYear}`);
        const courseData = courseReport.body;
        testReport = new Excel.Workbook();
        return testReport.xlsx.load(courseData);
      });
      it('Should only have a "Courses" sheet', function () {
        const worksheetNames = testReport.worksheets.map((sheet) => sheet.name);
        deepStrictEqual(worksheetNames, ['Courses']);
      });
      it('Should have a row for each course in the database', async function () {
        const courseCount = await courseRepository.count();
        const { number: rowCount } = testReport.getWorksheet('Courses').lastRow;
        // Add one for the header
        strictEqual(rowCount, courseCount + 1);
      });
      it('Should span the current Academic Year to the provided endYear', async function () {
        const columnHeaders: string[] = [];
        testReport
          .getWorksheet('Courses')
          .getRow(1)
          .eachCell((cell) => { columnHeaders.push(cell.text); });

        const allYears = await semesterService.getYearList();
        const currentIndex = allYears
          .findIndex((year) => year === currentAcademicYear.toString());
        const endIndex = allYears
          .findIndex((year) => year === endYear.toString());
        const yearRange = allYears.slice(currentIndex, endIndex + 1);
        const headerPairs = yearRange.reduce<string[]>(
          (pairs: string[], currentYear: string): string[] => {
            const fallYear = (parseInt(currentYear, 10) - 1);
            const fallHeader = `F'${fallYear.toString().slice(2)}`;
            const springHeader = `S'${currentYear.toString().slice(2)}`;
            return [...pairs, fallHeader, springHeader];
          }, []
        );
        headerPairs.forEach((header) => {
          const firstSemesterHeader = columnHeaders
            .findIndex((col) => col.includes(header));
          notStrictEqual(firstSemesterHeader, -1, `Header with ${header} does not appear`);
        });
      });
    });
    context('Providing a start and end year', function () {
      let startYear: number;
      let endYear: number;
      beforeEach(async function () {
        startYear = currentAcademicYear - 1;
        endYear = currentAcademicYear + 1;
        const courseReport = await request(api)
          .get(`/report/courses?startYear=${startYear}&endYear=${endYear}`);
        const courseData = courseReport.body;
        testReport = new Excel.Workbook();
        return testReport.xlsx.load(courseData);
      });
      it('Should only have a "Courses" sheet', function () {
        const worksheetNames = testReport.worksheets.map((sheet) => sheet.name);
        deepStrictEqual(worksheetNames, ['Courses']);
      });
      it('Should have a row for each course in the database', async function () {
        const courseCount = await courseRepository.count();
        const { number: rowCount } = testReport.getWorksheet('Courses').lastRow;
        // Add one for the header
        strictEqual(rowCount, courseCount + 1);
      });
      it('Should only include the years in the range', async function () {
        const columnHeaders: string[] = [];
        testReport
          .getWorksheet('Courses')
          .getRow(1)
          .eachCell((cell) => { columnHeaders.push(cell.text); });

        const allYears = await semesterService.getYearList();
        const startIndex = allYears
          .findIndex((year) => year === startYear.toString());
        const endIndex = allYears
          .findIndex((year) => year === endYear.toString());
        const yearRange = allYears.slice(startIndex, endIndex + 1);
        const headerPairs = yearRange.reduce<string[]>(
          (pairs: string[], currentYear: string): string[] => {
            const fallYear = (parseInt(currentYear, 10) - 1);
            const fallHeader = `F'${fallYear.toString().slice(2)}`;
            const springHeader = `S'${currentYear.toString().slice(2)}`;
            return [...pairs, fallHeader, springHeader];
          }, []
        );
        headerPairs.forEach((header) => {
          const firstSemesterHeader = columnHeaders
            .findIndex((col) => col.includes(header));
          notStrictEqual(firstSemesterHeader, -1, `Header with ${header} does not appear`);
        });
      });
    });
    context('With invalid data', function () {
      context('With an invalid startYear', function () {
        context('With a non-numeric value', function () {
          it('It should return a Bad Request error', async function () {
            const courseReport = await request(api).get('/report/courses?startYear=abcd');
            strictEqual(courseReport.status, HttpStatus.BAD_REQUEST);
            strictEqual(courseReport.body.message, 'Invalid start year');
          });
        });
        context('With an out of range value', function () {
          it('It should return a Bad Request error', async function () {
            const courseReport = await request(api).get('/report/courses?startYear=1');
            strictEqual(courseReport.status, HttpStatus.BAD_REQUEST);
            strictEqual(courseReport.body.message, 'Invalid start year');
          });
        });
      });
      context('With an invalid endYear', function () {
        context('With a non-numeric value', function () {
          it('It should return a Bad Request error', async function () {
            const courseReport = await request(api).get('/report/courses?endYear=abcd');
            strictEqual(courseReport.status, HttpStatus.BAD_REQUEST);
            strictEqual(courseReport.body.message, 'Invalid end year');
          });
        });
        context('With an out of range value', function () {
          it('It should return a Bad Request error', async function () {
            const courseReport = await request(api).get('/report/courses?endYear=2');
            strictEqual(courseReport.status, HttpStatus.BAD_REQUEST);
            strictEqual(courseReport.body.message, 'Invalid end year');
          });
        });
      });
      context('With an endYear before the startYear', function () {
        it('It should return a Bad Request error', async function () {
          const startYear = currentAcademicYear + 1;
          const endYear = currentAcademicYear - 1;
          const courseReport = await request(api)
            .get(`/report/courses?startYear=${startYear}&endYear=${endYear}`);
          strictEqual(courseReport.status, HttpStatus.BAD_REQUEST);
          strictEqual(courseReport.body.message, 'End year cannot be earlier than start year');
        });
      });
    });
  });
});
