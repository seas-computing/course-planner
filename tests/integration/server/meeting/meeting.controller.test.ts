import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import { HttpServer } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { Repository } from 'typeorm';
import { strictEqual, deepStrictEqual } from 'assert';
import { format, parse } from 'date-fns';
import MockDB from '../../../mocks/database/MockDB';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { ConfigModule } from '../../../../src/server/config/config.module';
import { AUTH_MODE, DAY } from '../../../../src/common/constants';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { MeetingModule } from '../../../../src/server/meeting/meeting.module';
import { BadRequestExceptionPipe } from '../../../../src/server/utils/BadRequestExceptionPipe';
import { AuthModule } from '../../../../src/server/auth/auth.module';
import { ConfigService } from '../../../../src/server/config/config.service';
import { CourseModule } from '../../../../src/server/course/course.module';
import { CourseInstanceModule } from '../../../../src/server/courseInstance/courseInstance.module';
import { CourseInstance } from '../../../../src/server/courseInstance/courseinstance.entity';
import { MeetingResponseDTO } from '../../../../src/common/dto/meeting/MeetingResponse.dto';
import { Meeting } from '../../../../src/server/meeting/meeting.entity';
import { MeetingListingView } from '../../../../src/server/meeting/MeetingListingView.entity';
import { RoomListingView } from '../../../../src/server/location/RoomListingView.entity';
import { MeetingRequestDTO } from '../../../../src/common/dto/meeting/MeetingRequest.dto';

describe.only('Meeting API', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let api: HttpServer;
  let authStub: SinonStub;
  let courseInstanceRepository: Repository<CourseInstance>;
  let meetingRepository: Repository<Meeting>;
  let meetingListingViewRepository: Repository<MeetingListingView>;

  before(async function () {
    this.timeout(120000);
    db = new MockDB();
    return db.init();
  });

  after(async function () {
    await db.stop();
  });

  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
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
        MeetingModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();
    courseInstanceRepository = testModule.get(
      getRepositoryToken(CourseInstance)
    );
    meetingListingViewRepository = testModule.get(
      getRepositoryToken(MeetingListingView)
    );
    meetingRepository = testModule.get(
      getRepositoryToken(Meeting)
    );
    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    api = nestApp.getHttpServer() as HttpServer;
  });

  afterEach(async function () {
    return testModule.close();
  });
  describe('PUT /:parentId', function () {
    context('When authenticated with admin permission', function () {
      beforeEach(function () {
        authStub.resolves(dummy.adminUser);
      });
      context('Updating a course instance', function () {
        let result: MeetingResponseDTO[];
        let testCourseInstance: CourseInstance;
        let newMeetings: MeetingRequestDTO[];
        context('When there are no existing meetings', function () {
          beforeEach(async function () {
            (testCourseInstance = await courseInstanceRepository
              .createQueryBuilder('ci')
              .select('ci.id', 'id')
              .addSelect('ci."updatedAt"', 'updatedAt')
              .where('m.id IS NULL')
              .limit(1)
              .leftJoin(Meeting, 'm', 'm."courseInstanceId" = ci.id')
              .getOne());
          });
          context('adding new meetings', function () {
            beforeEach(async function () {
              newMeetings = [
                dummy.mondayMeetingWithRoom,
                dummy.wednesdayMeetingWithRoom,
              ];

              const response = await request(api)
                .put(`/api/meetings/${testCourseInstance.id}`)
                .send({ meetings: newMeetings });
              result = response.body;
            });
            it('Should save the meetings as part of the courseInstance', async function () {
              const savedMeetings = await meetingRepository
                .find({
                  where: `"courseInstanceId"='${testCourseInstance.id}'`,
                });
              strictEqual(savedMeetings.length, newMeetings.length);
              const mondayMeeting = savedMeetings
                .find(({ day }) => day === DAY.MON);
              const wednesdayMeeting = savedMeetings
                .find(({ day }) => day === DAY.WED);
              strictEqual(
                mondayMeeting.startTime,
                dummy.mondayMeetingWithRoom.startTime
              );
              strictEqual(
                mondayMeeting.endTime,
                dummy.mondayMeetingWithRoom.endTime
              );
              strictEqual(
                wednesdayMeeting.startTime,
                dummy.wednesdayMeetingWithRoom.startTime
              );
              strictEqual(
                wednesdayMeeting.endTime,
                dummy.wednesdayMeetingWithRoom.endTime
              );
            });
            it('Should return the new meetings, formatted with room data', async function () {
              const formattedMeetings = await meetingListingViewRepository
                .createQueryBuilder()
                .where(
                  '"courseInstanceId"=:ciid',
                  { ciid: testCourseInstance.id }
                )
                .orderBy('day', 'ASC')
                .addOrderBy('"startTime"', 'ASC')
                .addOrderBy('"endTime"', 'ASC')
                .getMany();
              strictEqual(
                JSON.stringify(result),
                JSON.stringify(formattedMeetings)
              );
            });
          });
        });
        context('When there are existing meetings', function () {
          beforeEach(async function () {
            const allInstances = await courseInstanceRepository
              .find({ relations: ['meetings', 'meetings.room'] });
            (testCourseInstance = allInstances.find(
              ({ meetings }) => meetings
              && meetings.length > 1
              && meetings.every((mtg) => 'room' in mtg)
            ));
          });
          context('Updating an existing meeting', function () {
            let meetingToEdit: Meeting;
            let updatedMeeting: Meeting;
            let savedMeeting: MeetingResponseDTO;
            let otherMeetings: Meeting[];
            context.only('With the same room', function () {
              beforeEach(async function () {
                ([
                  meetingToEdit,
                  ...otherMeetings
                ] = testCourseInstance.meetings);
                updatedMeeting = new Meeting();
                Object.assign(updatedMeeting, meetingToEdit);
                updatedMeeting.day = DAY.MON;
                updatedMeeting.startTime = '00:00:01-05';
                updatedMeeting.endTime = '23:59:59-05';
                const response = await request(api)
                  .put(`/api/meetings/${testCourseInstance.id}`)
                  .send({
                    meetings: [
                      updatedMeeting,
                      ...otherMeetings,
                    ].map(({ room, ...mtg }) => ({ ...mtg, roomId: room.id })),
                  });
                result = response.body;
                savedMeeting = result
                  .find(({ id }) => id === meetingToEdit.id);
              });
              it('Should update the meeting day', function () {
                strictEqual(savedMeeting.day, updatedMeeting.day);
              });
              it('Should update the meeting startTime', function () {
                const parsedStartTime = parse(
                  updatedMeeting.startTime,
                  'HH:mm:ssX',
                  dummy.refDate
                );
                const updatedStartTime = format(parsedStartTime, 'hh:mm a');
                strictEqual(savedMeeting.startTime, updatedStartTime);
              });
              it('Should update the meeting endTime', function () {
                const parsedEndTime = parse(
                  updatedMeeting.endTime,
                  'HH:mm:ssX',
                  dummy.refDate
                );
                const updatedEndTime = format(parsedEndTime, 'hh:mm a');
                strictEqual(savedMeeting.endTime, updatedEndTime);
              });
              it.only('Should not change the room', function () {
                console.log(savedMeeting);
                deepStrictEqual(savedMeeting.room, meetingToEdit.room);
              });
              it('Should not affect the other meetings', function () {
                const unaffectedMeetings = result
                  .filter(({ id }) => id !== updatedMeeting.id);
                console.log(unaffectedMeetings);
                deepStrictEqual(unaffectedMeetings, otherMeetings);
              });
            });
            context('With a different room', function () {
              context('When the room is available', function () {});
              context('When the room is already booked', function () {});
            });
            context('Removing the room', function () {});
          });
          context('Adding a new meeting', function () {
            context('When the room is available', function () {});
            context('When the room is already booked', function () {});
            context('When there is no room', function () {});
          });
          context('removing a meeting', function () {});
        });
      });
      context('Updating a non-class event', function () {
        context('When there are no existing meetings', function () {
          context('adding new meetings', function () {});
        });
        context('When there are existing meetings', function () {
          context('Updating an existing meeting', function () {
            context('With the same room', function () {});
            context('With a different room', function () {
              context('When the room is available', function () {});
              context('When the room is already booked', function () {});
            });
            context('Removing the room', function () {});
          });
          context('Adding a new meeting', function () {
            context('When the room is available', function () {});
            context('When the room is already booked', function () {});
            context('When there is no room', function () {});
          });
          context('removing a meeting', function () {});
        });
      });
      context('With an invalid id', function () {});
      context('With no id', function () {});
    });
    context('When unauthenticated', function () {});
    context('When not an admin', function () {});
  });
});
