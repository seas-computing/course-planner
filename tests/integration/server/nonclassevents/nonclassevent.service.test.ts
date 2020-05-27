import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from 'server/config/config.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NonClassEventModule } from 'server/nonClassEvent/nonclassevent.module';
import { SemesterModule } from 'server/semester/semester.module';
import { AuthModule } from 'server/auth/auth.module';
import { NonClassEventService } from 'server/nonClassEvent/nonClassEvent.service';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { strictEqual } from 'assert';

describe('NonClassEvent Service', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let service: NonClassEventService;
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
        SemesterModule,
        NonClassEventModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();
    service = testModule.get(NonClassEventService);
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('find', function () {
    it('retrieves data for the academic year specified', async function () {
      const expectedAcdemicYear = 2019;

      const events = await service.find();
      const fallIsCorrect = events.map((event) => event.fall.academicYear)
        .every((academicYear) => academicYear === expectedAcdemicYear);

      const springIsCorrect = events.map((event) => event.spring.academicYear)
        .every((academicYear) => academicYear === expectedAcdemicYear + 1);

      strictEqual(fallIsCorrect, true);
      strictEqual(springIsCorrect, true);
    });
  });
});
