import { notStrictEqual, strictEqual } from 'assert';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { FacultyScheduleService } from 'server/faculty/facultySchedule.service';
import { FacultyModule } from 'server/faculty/faculty.module';
import { FacultyResponseDTO } from 'common/dto/faculty/FacultyResponse.dto';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import MockDB from '../../../mocks/database/MockDB';

describe('Faculty Schedule Service', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let fsService: FacultyScheduleService;
  before(async function () {
    db = new MockDB();
    await db.init();
  });
  after(async function () {
    await db.stop();
  });
  beforeEach(async function () {
    testModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (
            config: ConfigService
          ): Promise<TypeOrmModuleOptions> => ({
            ...config.dbOptions,
            synchronize: true,
            autoLoadEntities: true,
            retryAttempts: 10,
            retryDelay: 10000,
          }),
          inject: [ConfigService],
        }),
        AuthModule,
        PopulationModule,
        FacultyModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();
    fsService = testModule.get(FacultyScheduleService);
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('getAllFaculty', function () {
    let result: { [key: string]: FacultyResponseDTO[] };
    const acadYears = [2019];
    beforeEach(async function () {
      result = await fsService.getAll(acadYears);
    });
    it('should return a non empty object of data', function () {
      notStrictEqual(Object.keys(result).length, 0);
    });
    it('should return instances from the given academic year only', function () {
      const actual = Object.keys(result)
        .every((year) => acadYears.includes(parseInt(year, 10)));
      strictEqual(actual, true);
    });
    it('should return the faculty ordered by area, then last name, and then first name', function () {
      const sorted = {};
      Object.keys(result).forEach((key) => {
        sorted[key] = result[key].slice().sort((a, b) => {
          if (a.area < b.area) {
            return -1;
          } if (a.area > b.area) {
            return 1;
          } if (a.lastName < b.lastName) {
            return -1;
          } if (a.lastName > b.lastName) {
            return 1;
          } if (a.firstName < b.firstName) {
            return -1;
          }
          return 0;
        });
      });
    });
  });
});
