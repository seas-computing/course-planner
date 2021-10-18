import { ConfigModule } from 'server/config/config.module';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from 'server/config/config.service';
import { Test, TestingModule } from '@nestjs/testing';
import { NonClassEventModule } from 'server/nonClassEvent/nonclassevent.module';
import { SemesterModule } from 'server/semester/semester.module';
import { AuthModule } from 'server/auth/auth.module';
import { NonClassEventService } from 'server/nonClassEvent/nonClassEvent.service';
import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert';
import { Meeting } from 'server/meeting/meeting.entity';
import { Repository } from 'typeorm';
import { appliedMathematicsReadingGroup } from 'testData';
import { Semester } from 'server/semester/semester.entity';
import { Area } from 'server/area/area.entity';
import { NonClassParent } from 'server/nonClassEvent/nonclassparent.entity';
import { NonClassEvent } from 'server/nonClassEvent/nonclassevent.entity';
import { AUTH_MODE } from 'common/constants';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';

describe('NonClassEvent Service', function () {
  let testModule: TestingModule;
  let service: NonClassEventService;
  let semesterRepository: Repository<Semester>;
  let areaRepository: Repository<Area>;

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
        SemesterModule,
        NonClassEventModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();
    service = testModule.get(NonClassEventService);
    semesterRepository = testModule.get(getRepositoryToken(Semester));
    areaRepository = testModule.get(getRepositoryToken(Area));
    await testModule.createNestApplication().init();
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('find', function () {
    it('retrieves data for the academic year specified', async function () {
      const expectedAcdemicYear = 2020;

      const events = await service.find(expectedAcdemicYear);

      const springAcademicYears = events.map((event) => event.fall.calendarYear)
        .map((acyr) => parseInt(acyr));

      const fallAcademicyears = events.map((event) => event.spring.calendarYear)
        .map((acyr) => parseInt(acyr));

      deepStrictEqual(springAcademicYears.length > 0, true);
      deepStrictEqual(fallAcademicyears.length > 0, true);
      deepStrictEqual(
        springAcademicYears,
        Array(springAcademicYears.length).fill(expectedAcdemicYear)
      );
      deepStrictEqual(
        fallAcademicyears,
        Array(fallAcademicyears.length).fill(expectedAcdemicYear)
      );
    });
    describe('Meetings', function () {
      let dbMeetings: Meeting[];
      let meetingRepository: Repository<Meeting>;
      beforeEach(async function () {
        meetingRepository = testModule.get(getRepositoryToken(Meeting));
        dbMeetings = await meetingRepository.find({
          relations: ['room', 'room.building'],
        });
      });
      it('Should concatenate the room and building name', async function () {
        const expectedAcdemicYear = 2020;

        const events = await service.find(expectedAcdemicYear);

        notStrictEqual(events.length, 0);
        events.forEach(({ spring, fall }) => {
          [spring, fall].forEach(({ meetings }) => {
            meetings.forEach(({ id, room }) => {
              if (id) {
                const { room: dbRoom } = dbMeetings
                  .find(({ id: dbID }) => dbID === id);
                const catName = `${dbRoom.building.name} ${dbRoom.name}`;
                strictEqual(room.name, catName);
              }
            });
          });
        });
      });
    });
  });
  describe('createWithNonClassEvents', function () {
    let parentRepository: Repository<NonClassParent>;
    let eventRepository: Repository<NonClassEvent>;
    beforeEach(async function () {
      parentRepository = testModule
        .get<Repository<NonClassParent>>(getRepositoryToken(NonClassParent));
      eventRepository = testModule
        .get<Repository<NonClassEvent>>(getRepositoryToken(NonClassEvent));
      await parentRepository.query(`TRUNCATE "${parentRepository.metadata.tableName}" CASCADE;`);
    });
    it('creates one non-class parent', async function () {
      const area = await areaRepository.findOne();

      await service.createWithNonClassEvents({
        area,
        title: appliedMathematicsReadingGroup.title,
      });

      const dbParents = await parentRepository.count();

      strictEqual(dbParents, 1);
    });
    it('creates one non-class event per semester', async function () {
      const area = await areaRepository.findOne();
      const semesterIds = (await semesterRepository.find())
        .map(({ id }) => id);

      const { id } = await service.createWithNonClassEvents({
        area,
        title: appliedMathematicsReadingGroup.title,
      });

      const eventSemesterIds = (await eventRepository.find({
        relations: ['semester'],
        where: {
          nonClassParent: id,
        },
      }))
        .map(({ semester }) => semester.id);

      deepStrictEqual(eventSemesterIds.sort(), semesterIds.sort());
    });
    it('returns the newly created non-class parent', async function () {
      const area = await areaRepository.findOne();

      const parent = await service.createWithNonClassEvents({
        area,
        title: appliedMathematicsReadingGroup.title,
      });

      notStrictEqual(parent.id, null);
      strictEqual(parent.title, appliedMathematicsReadingGroup.title);
    });
  });
});
