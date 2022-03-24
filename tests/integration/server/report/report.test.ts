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
  HttpServer,
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
  });
});
