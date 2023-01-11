import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { strictEqual } from 'assert';
import { Absence } from 'server/absence/absence.entity';
import { Area } from 'server/area/area.entity';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyModule } from 'server/faculty/faculty.module';
import { Semester } from 'server/semester/semester.entity';
import { appliedMathFacultyMember } from 'testData';
import { Repository } from 'typeorm';
import { PopulationModule } from '../../../mocks/database/population/population.module';

describe('Faculty subscriber', function () {
  let module: TestingModule;
  let facultyRepository: Repository<Faculty>;
  let absenceRepository: Repository<Absence>;
  let area: Area;
  let semesters: Semester[];

  beforeEach(async function () {
    module = await Test.createTestingModule({
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
        PopulationModule,
        FacultyModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();
    facultyRepository = module
      .get<Repository<Faculty>>(getRepositoryToken(Faculty));
    absenceRepository = module
      .get<Repository<Absence>>(getRepositoryToken(Absence));
    const semesterRepository = module
      .get<Repository<Semester>>(getRepositoryToken(Semester));
    const areaRepository = module
      .get<Repository<Area>>(getRepositoryToken(Area));
    await module.createNestApplication().init();

    area = await areaRepository.findOne();
    semesters = await semesterRepository.find();

    // Delete all the faculty (and their absences) currently in the DB. Since
    // this test is all about the creation of faculty, starting with an empty
    // faculty and absence table is the only sane thing to do here.
    await facultyRepository
      .query(`TRUNCATE ${facultyRepository.metadata.name} CASCADE`);
  });
  afterEach(async function () {
    await module.close();
  });
    it('creates a new absence record for each semester', async function () {
      // Create a new faculty member
      await facultyRepository.save({
        firstName: appliedMathFacultyMember.firstName,
        lastName: appliedMathFacultyMember.lastName,
        HUID: appliedMathFacultyMember.HUID,
        category: appliedMathFacultyMember.category,
        area,
      });

      const absences = await absenceRepository.find();

      strictEqual(semesters.length, absences.length);
    });
    it('creates new absence records for the given faculty member', async function () {
      const {
        id: facultyId,
      } = await facultyRepository.save({
        firstName: appliedMathFacultyMember.firstName,
        lastName: appliedMathFacultyMember.lastName,
        HUID: appliedMathFacultyMember.HUID,
        category: appliedMathFacultyMember.category,
        area,
      });

      const absencesMatchfaculty = (await absenceRepository.find({
        relations: ['faculty'],
      })).every(({ faculty }) => faculty.id === facultyId);

      strictEqual(absencesMatchfaculty, true);
    });
  });
});
