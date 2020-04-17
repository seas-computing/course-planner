import { FacultyService } from 'server/faculty/faculty.service';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { FacultyModule } from 'server/faculty/faculty.module';
import { deepStrictEqual, strictEqual } from 'assert';
import { Repository } from 'typeorm';
import { Faculty } from 'server/faculty/faculty.entity';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';

describe('Faculty service', function () {
  let facultyService: FacultyService;
  let facultyRepository: Repository<Faculty>;
  let db: MockDB;
  let testModule: TestingModule;

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
        PopulationModule,
        FacultyModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();

    facultyService = testModule.get<FacultyService>(FacultyService);
    facultyRepository = testModule.get(getRepositoryToken(Faculty));
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  it('returns all faculty members in the database', async function () {
    const facultyCount = await facultyRepository.count({
      relations: ['area'],
    });

    const returnedFaculty = await facultyService.find();

    strictEqual(returnedFaculty.length, facultyCount);
  });
  it('sorts faculty members by area', async function () {
    const expectedFaculty = await facultyRepository.find({
      relations: ['area'],
    });
    const expectedAreas = [
      ...new Set(
        expectedFaculty
          .filter(({ area }) => area !== null)
          .map(({ area }) => area.name)
          .sort((a, b) => {
            let position: number;
            if (a === b) {
              position = 0;
            } else if (a > b) {
              position = 1;
            } else if (b > a) {
              position = -1;
            }
            return position;
          })
      ),
    ];

    const actualFaculty = await facultyService.find();
    const actualAreas = [
      ...new Set(
        actualFaculty
          .filter(({ area }) => area !== null)
          .map(({ area }) => area.name)
      ),
    ];
    deepStrictEqual(actualAreas, expectedAreas);
  });
});
