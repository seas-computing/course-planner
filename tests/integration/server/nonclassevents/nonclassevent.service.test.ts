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
import { PopulationModule } from '../../../mocks/database/population/population.module';
import MockDB from '../../../mocks/database/MockDB';
import { PGTime } from '../../../../src/common/utils/PGTime';

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
      const expectedAcdemicYear = 2020;

      const events = await service.find(expectedAcdemicYear);

      const springAcademicYears = events.map((event) => event.fall.academicYear)
        .map((acyr) => parseInt(acyr));

      const fallAcademicyears = events.map((event) => event.spring.academicYear)
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
      it('Should format the startTimes and endTimes as hh:mm aa', async function () {
        const expectedAcdemicYear = 2020;

        const events = await service.find(expectedAcdemicYear);

        notStrictEqual(events.length, 0);
        events.forEach(({ spring, fall }) => {
          [spring, fall].forEach(({ meetings }) => {
            meetings.forEach(({ id, startTime, endTime }) => {
              if (id) {
                const {
                  startTime: dbStartTime,
                  endTime: dbEndTime,
                } = dbMeetings
                  .find(
                    ({ id: dbID }) => dbID === id
                  );
                // We're using Jan 1 as the date because JS is being too clever
                // and always trying to componsate for DST for us.
                const fmtDBStartTime = new PGTime(dbStartTime);
                const fmtDBEndTime = new PGTime(dbEndTime);
                strictEqual(startTime, fmtDBStartTime.displayTime);
                strictEqual(endTime, fmtDBEndTime.displayTime);
              }
            });
          });
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
});
