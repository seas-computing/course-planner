import { FacultyService } from 'server/faculty/faculty.service';
import { TestingModule, Test } from '@nestjs/testing';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { FacultyModule } from 'server/faculty/faculty.module';
import { deepStrictEqual, strictEqual } from 'assert';
import { Repository } from 'typeorm';
import { Faculty } from 'server/faculty/faculty.entity';
import { appliedMathFacultyMemberRequest, bioengineeringFacultyMember } from 'testData';
import { Area } from 'server/area/area.entity';
import { AuthModule } from 'server/auth/auth.module';
import { AUTH_MODE } from 'common/constants';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { InstructorResponseDTO } from '../../../../src/common/dto/courses/InstructorResponse.dto';

describe('Faculty service', function () {
  let facultyService: FacultyService;
  let facultyRepository: Repository<Faculty>;
  let areaRepository: Repository<Area>;
  let testModule: TestingModule;

  beforeEach(async function () {
    testModule = await Test.createTestingModule({
      imports: [
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
        FacultyModule,
      ],
      providers: [
        {
          provide: getRepositoryToken(Area),
          useValue: new Repository<Area>(),
        },
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    facultyService = testModule.get<FacultyService>(FacultyService);
    facultyRepository = testModule.get(getRepositoryToken(Faculty));
    areaRepository = testModule.get(getRepositoryToken(Area));
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('find', function () {
    it('returns all faculty members in the database', async function () {
      const facultyCount = await facultyRepository.count({
        relations: ['area'],
      });

      const returnedFaculty = await facultyService.find();

      strictEqual(returnedFaculty.length, facultyCount);
    });
    it('sorts faculty members by area', async function () {
      await facultyRepository.query(`TRUNCATE ${Faculty.name} CASCADE`);
      const [
        appliedMath,
        bioengineering,
      ] = await areaRepository.save([
        {
          name: appliedMathFacultyMemberRequest.area,
        },
        {
          name: bioengineeringFacultyMember.area,
        },
      ]);

      // Save two faculty members in the database with their faculty areas
      // deliberately not in alphabetical order
      await facultyRepository.save([
        {
          ...bioengineeringFacultyMember,
          area: bioengineering,
        },
        {
          ...appliedMathFacultyMemberRequest,
          area: appliedMath,
        },
      ]);

      const faculty = await facultyService.find();

      deepStrictEqual(
        faculty.map(({ area }) => area.name),
        [
          appliedMath.name,
          bioengineering.name,
        ]
      );
    });
    it('sorts faculty members by last name in ascending order', async function () {
      await facultyRepository.query(`TRUNCATE ${Faculty.name} CASCADE`);
      const [appliedMath] = await areaRepository.save([
        {
          name: appliedMathFacultyMemberRequest.area,
        },
      ]);
      // Save two example faculty members in the database, deliberately not
      // in alphabetical order
      const [
        faculty1,
        faculty2,
      ] = await facultyRepository.save([
        {
          ...appliedMathFacultyMemberRequest,
          // Slightly weird lastName to force the sorting and prove that it's
          // working
          lastName: 'zzzzzzzzz',
          area: appliedMath,
        },
        {
          ...bioengineeringFacultyMember,
          // Slightly weird lastName to force the sorting and prove that it's
          // working
          lastName: 'aaaaaaaaa',
          area: appliedMath,
        },
      ]);

      const actualFaculty = await facultyService.find();
      const actualLastNames = [
        ...new Set(actualFaculty.map(({ lastName }) => lastName)),
      ];

      // Faculty 2 should come before faculty 1 because we're sorting by
      // lastname ASC (aaa comes before zzz)
      deepStrictEqual(actualLastNames, [
        faculty2.lastName,
        faculty1.lastName,
      ]);
    });

    it('sorts faculty members by first name in ascending order', async function () {
      await facultyRepository.query(`TRUNCATE ${Faculty.name} CASCADE`);
      const [appliedMath] = await areaRepository.save([
        {
          name: appliedMathFacultyMemberRequest.area,
        },
      ]);
      // Save two example faculty members in the database, deliberately not
      // in alphabetical order
      const [
        faculty1,
        faculty2,
      ] = await facultyRepository.save([
        {
          ...appliedMathFacultyMemberRequest,
          // Slightly weird first and last names to force the sorting and prove
          // that it's working
          firstName: 'zzzzzzzzz',
          lastName: 'zzzzzzzzz',
          area: appliedMath,
        },
        {
          ...bioengineeringFacultyMember,
          // Slightly weird first and last names to force the sorting and prove
          // that it's working
          firstName: 'zaaaazzzz',
          lastName: 'zzzzzzzzz',
          area: appliedMath,
        },
      ]);

      const actualFaculty = await facultyService.find();
      const actualLastNames = [
        ...new Set(actualFaculty.map(({ firstName }) => firstName)),
      ];

      // Faculty 2 should come before faculty 1 because we're sorting by
      // lastname ASC (aaa comes before zzz)
      deepStrictEqual(actualLastNames, [
        faculty2.firstName,
        faculty1.firstName,
      ]);
    });
  });
  describe('getInstructorList', function () {
    let result: InstructorResponseDTO[];
    beforeEach(async function () {
      result = await facultyService.getInstructorList();
    });
    it('returns all of the faculty', async function () {
      const facultyCount = await facultyRepository.count();
      strictEqual(result.length, facultyCount);
    });
    it('orders by the display name', function () {
      const sortedResult = [...result].sort(
        (
          { displayName: a },
          { displayName: b }
        ) => {
          if (a < b) {
            return -1;
          }
          if (b < a) {
            return 1;
          }
          return 0;
        }
      );
      deepStrictEqual(result, sortedResult);
    });
  });
  // import { FacultyAbsence } from 'common/dto/faculty/FacultyResponse.dto';
  // describe('updateFacultyAbsences', function () {
  //   let result: FacultyAbsence;
  //   beforeEach(async function () {
  //     result = await facultyService.updateFacultyAbsences (absenceDTO);
  //   });
  //   it('returns absence update', async function () {
  //     strictEqual(result, absenceDTO);
  //   });
  // });
});
