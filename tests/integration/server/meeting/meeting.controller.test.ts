import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import { stub, SinonStub } from 'sinon';
import request, { Response } from 'supertest';
import { HttpServer, HttpStatus } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions, getRepositoryToken } from '@nestjs/typeorm';
import * as dummy from 'testData';
import { Repository } from 'typeorm';
import { strictEqual, notStrictEqual, deepStrictEqual } from 'assert';
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
import { RoomBookingInfoView } from '../../../../src/server/location/RoomBookingInfoView.entity';
import { Room } from '../../../../src/server/location/room.entity';
import { NonClassEvent } from '../../../../src/server/nonClassEvent/nonclassevent.entity';
import { PGTime } from '../../../../src/common/utils/PGTime';

describe('Meeting API', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let api: HttpServer;
  let authStub: SinonStub;
  let courseInstanceRepository: Repository<CourseInstance>;
  let meetingRepository: Repository<Meeting>;
  let meetingListingViewRepository: Repository<MeetingListingView>;
  let nonClassEventRepository: Repository<NonClassEvent>;
  let roomRepository: Repository<Room>;
  let roomBookingInfoRepository: Repository<RoomBookingInfoView>;

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
    nonClassEventRepository = testModule.get(
      getRepositoryToken(NonClassEvent)
    );
    roomRepository = testModule.get(
      getRepositoryToken(Room)
    );
    roomBookingInfoRepository = testModule.get(
      getRepositoryToken(RoomBookingInfoView)
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
    let response: Response;
    let result: MeetingResponseDTO[];
    context('When authenticated with admin permission', function () {
      beforeEach(function () {
        authStub.resolves(dummy.adminUser);
      });
      context('Updating a course instance', function () {
        let testCourseInstance: CourseInstance;
        let newMeetings: MeetingRequestDTO[];
        context('When there are no existing meetings', function () {
          beforeEach(async function () {
            const getMeetinglessCourse = courseInstanceRepository
              .createQueryBuilder('ci')
              .where('m.id IS NULL')
              .leftJoinAndSelect(Meeting, 'm', 'm."courseInstanceId" = ci.id');

            (testCourseInstance = await getMeetinglessCourse.getOne());
          });

          context('adding new meetings', function () {
            beforeEach(async function () {
              newMeetings = [
                dummy.mondayMeetingWithRoom,
                dummy.wednesdayMeetingWithRoom,
              ];

              response = await request(api)
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
                .createQueryBuilder('ci')
                .where(
                  '"courseInstanceId"=:ciid',
                  { ciid: testCourseInstance.id }
                )
                .orderBy('day', 'ASC')
                .addOrderBy('"startTime"', 'ASC')
                .addOrderBy('"endTime"', 'ASC')
                .leftJoinAndMapOne('ci.room', RoomListingView, 'r', 'r.id=ci."roomId"')
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
              .find({ relations: ['semester', 'meetings', 'meetings.room'] });
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
            context('With the same room', function () {
              beforeEach(async function () {
                ([
                  meetingToEdit,
                  ...otherMeetings
                ] = testCourseInstance.meetings);
                updatedMeeting = new Meeting();
                Object.assign(updatedMeeting, meetingToEdit);
                updatedMeeting.day = DAY.MON;
                updatedMeeting.startTime = '10:00:00';
                updatedMeeting.endTime = '16:00:00';
                response = await request(api)
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
                const updatedStartTime = new PGTime(
                  updatedMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, updatedStartTime);
              });
              it('Should update the meeting endTime', function () {
                const updatedEndTime = new PGTime(
                  updatedMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, updatedEndTime);
              });
              it('Should not change the room', function () {
                strictEqual(savedMeeting.room.id, meetingToEdit.room.id);
              });
            });
            context('With a different room', function () {
              context('When the room is available', function () {
                let unbookedRoom: Room;
                beforeEach(async function () {
                  ([
                    meetingToEdit,
                    ...otherMeetings
                  ] = testCourseInstance.meetings);
                  updatedMeeting = new Meeting();
                  Object.assign(updatedMeeting, meetingToEdit);
                  updatedMeeting.day = DAY.MON;
                  updatedMeeting.startTime = '10:00:00';
                  updatedMeeting.endTime = '16:00:00';
                  const unbookedRoomQuery = roomRepository
                    .createQueryBuilder('r')
                    .where('r.id <> :roomId', { roomId: updatedMeeting.room.id })
                    .andWhere('"meetingTitle" IS NULL')
                    .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.MON}'`);
                  unbookedRoom = await unbookedRoomQuery
                    .getOne();
                  updatedMeeting.room = unbookedRoom;
                  response = await request(api)
                    .put(`/api/meetings/${testCourseInstance.id}`)
                    .send({
                      meetings: [
                        updatedMeeting,
                        ...otherMeetings,
                      ].map(({ room, ...mtg }) => ({
                        ...mtg, roomId: room?.id,
                      })),
                    });
                  result = response.body;
                  savedMeeting = result
                    .find(({ id }) => id === meetingToEdit.id);
                });
                it('Should update the meeting day', function () {
                  strictEqual(savedMeeting.day, updatedMeeting.day);
                });
                it('Should update the meeting startTime', function () {
                  const updatedStartTime = new PGTime(
                    updatedMeeting.startTime
                  ).displayTime;
                  strictEqual(savedMeeting.startTime, updatedStartTime);
                });
                it('Should update the meeting endTime', function () {
                  const updatedEndTime = new PGTime(
                    updatedMeeting.endTime
                  ).displayTime;
                  strictEqual(savedMeeting.endTime, updatedEndTime);
                });
                it('Should change the room', function () {
                  strictEqual(savedMeeting.room.id, unbookedRoom.id);
                  notStrictEqual(savedMeeting.room.id, meetingToEdit.room.id);
                  notStrictEqual(savedMeeting.room, undefined);
                });
              });
              context('When the room is already booked', function () {
                let bookedRoom: Room;
                beforeEach(async function () {
                  ([
                    meetingToEdit,
                    ...otherMeetings
                  ] = testCourseInstance.meetings);
                  updatedMeeting = new Meeting();
                  Object.assign(updatedMeeting, meetingToEdit);
                  updatedMeeting.day = DAY.MON;
                  updatedMeeting.startTime = '10:00:00';
                  updatedMeeting.endTime = '16:00:00';
                  const bookedRoomQuery = roomRepository
                    .createQueryBuilder('r')
                    .where('r.id <> :roomId', { roomId: updatedMeeting.room.id })
                    .andWhere('"meetingTitle" IS NOT NULL')
                    .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.MON}'`);
                  bookedRoom = await bookedRoomQuery
                    .getOne();
                  updatedMeeting.room = bookedRoom;
                  response = await request(api)
                    .put(`/api/meetings/${testCourseInstance.id}`)
                    .send({
                      meetings: [
                        updatedMeeting,
                        ...otherMeetings,
                      ].map(({ room, ...mtg }) => ({
                        ...mtg, roomId: room?.id,
                      })),
                    });
                });
                it('Should return a Bad Request error', function () {
                  strictEqual(response.status, HttpStatus.BAD_REQUEST);
                });
                it('Should list the meetings that have the room booked', async function () {
                  const roomBookingQuery = roomBookingInfoRepository
                    .createQueryBuilder()
                    .select('array_agg("meetingTitle")', 'meetingTitles')
                    .groupBy('"roomId"')
                    .addGroupBy('"calendarYear"')
                    .addGroupBy('term')
                    .addGroupBy('day')
                    .where('"roomId" = :roomId', { roomId: updatedMeeting.room.id })
                    .andWhere('day = :roomDay', { roomDay: updatedMeeting.day })
                    .andWhere('term = :ciTerm', {
                      ciTerm: testCourseInstance.semester.term,
                    })
                    .andWhere('"calendarYear" = :ciYear', {
                      ciYear: testCourseInstance.semester.academicYear,
                    })
                    .andWhere('day = :roomDay', {
                      roomDay: updatedMeeting.day,
                    })
                    .andWhere(
                      '(:startTime::TIME, :endTime::TIME) OVERLAPS ("startTime", "endTime")',
                      {
                        startTime: updatedMeeting.startTime,
                        endTime: updatedMeeting.endTime,
                      }
                    );
                  const { meetingTitles } = await roomBookingQuery.getRawOne();
                  const errorResponse = response.body.message as string;
                  strictEqual(Array.isArray(meetingTitles), true);
                  strictEqual(meetingTitles.length > 0, true);
                  strictEqual(
                    errorResponse.includes(meetingTitles),
                    true
                  );
                });
              });
            });
            context('Removing the room', function () {
              beforeEach(async function () {
                ([
                  meetingToEdit,
                  ...otherMeetings
                ] = testCourseInstance.meetings);
                updatedMeeting = new Meeting();
                Object.assign(updatedMeeting, meetingToEdit);
                updatedMeeting.day = DAY.MON;
                updatedMeeting.startTime = '10:00:00';
                updatedMeeting.endTime = '16:00:00';
                updatedMeeting.room = null;
                response = await request(api)
                  .put(`/api/meetings/${testCourseInstance.id}`)
                  .send({
                    meetings: [
                      updatedMeeting,
                      ...otherMeetings,
                    ].map(({ room, ...mtg }) => ({ ...mtg, roomId: room?.id })),
                  });
                result = response.body;
                savedMeeting = result
                  .find(({ id }) => id === meetingToEdit.id);
              });
              it('Should update the meeting day', function () {
                strictEqual(savedMeeting.day, updatedMeeting.day);
              });
              it('Should update the meeting startTime', function () {
                const updatedStartTime = new PGTime(
                  updatedMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, updatedStartTime);
              });
              it('Should update the meeting endTime', function () {
                const updatedEndTime = new PGTime(
                  updatedMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, updatedEndTime);
              });
              it('Should blank the room', function () {
                strictEqual(savedMeeting.room, null);
              });
            });
          });
          context('Adding a new meeting', function () {
            let newMeeting: Meeting;
            let otherMeetings: Meeting[];
            let savedMeeting: MeetingResponseDTO;
            context('When the room is available', function () {
              let unbookedRoom: Room;
              beforeEach(async function () {
                ([
                  ...otherMeetings
                ] = testCourseInstance.meetings);
                newMeeting = new Meeting();
                newMeeting.day = DAY.FRI;
                newMeeting.startTime = '10:00:00';
                newMeeting.endTime = '16:00:00';
                const unbookedRoomQuery = roomRepository
                  .createQueryBuilder('r')
                  .where('"meetingTitle" IS NULL')
                  .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.FRI}'`);
                unbookedRoom = await unbookedRoomQuery
                  .getOne();
                newMeeting.room = unbookedRoom;
                response = await request(api)
                  .put(`/api/meetings/${testCourseInstance.id}`)
                  .send({
                    meetings: [
                      ...otherMeetings,
                      newMeeting,
                    ].map(({ room, ...mtg }) => ({
                      ...mtg, roomId: room?.id,
                    })),
                  });
                result = response.body;
                const otherIds = otherMeetings.map(({ id }) => id);
                savedMeeting = result
                  .find(({ id }) => (!otherIds.includes(id)));
              });
              it('Should include the new meeting in the result', function () {
                strictEqual(savedMeeting.day, newMeeting.day);
                const newStartTime = new PGTime(
                  newMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, newStartTime);
                const newEndTime = new PGTime(
                  newMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, newEndTime);
                strictEqual(savedMeeting.room.id, newMeeting.room.id);
              });
              it('Should add the new meeting in the database', async function () {
                const dbMeeting = await meetingRepository.findOne(
                  savedMeeting.id,
                  { relations: ['room'] }
                );
                strictEqual(dbMeeting.day, newMeeting.day);
                strictEqual(dbMeeting.startTime, newMeeting.startTime);
                strictEqual(dbMeeting.endTime, newMeeting.endTime);
                strictEqual(dbMeeting.room.id, newMeeting.room.id);
              });
            });
            context('When the room is already booked', function () {
              let bookedRoom: Room;
              beforeEach(async function () {
                ([
                  ...otherMeetings
                ] = testCourseInstance.meetings);
                newMeeting = new Meeting();
                newMeeting.day = DAY.FRI;
                newMeeting.startTime = '10:00:00';
                newMeeting.endTime = '16:00:00';
                const bookedRoomQuery = roomRepository
                  .createQueryBuilder('r')
                  .where('"meetingTitle" IS NOT NULL')
                  .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.FRI}'`);
                bookedRoom = await bookedRoomQuery
                  .getOne();
                newMeeting.room = bookedRoom;
                response = await request(api)
                  .put(`/api/meetings/${testCourseInstance.id}`)
                  .send({
                    meetings: [
                      ...otherMeetings,
                      newMeeting,
                    ].map(({ room, ...mtg }) => ({
                      ...mtg, roomId: room?.id,
                    })),
                  });
              });
              it('Should return a Bad Request error', function () {
                strictEqual(response.status, HttpStatus.BAD_REQUEST);
              });
              it('Should list the meetings that have the room booked', async function () {
                const roomBookingQuery = roomBookingInfoRepository
                  .createQueryBuilder()
                  .select('array_agg("meetingTitle")', 'meetingTitles')
                  .groupBy('"roomId"')
                  .addGroupBy('"calendarYear"')
                  .addGroupBy('term')
                  .addGroupBy('day')
                  .where('"roomId" = :roomId', { roomId: newMeeting.room.id })
                  .andWhere('day = :roomDay', { roomDay: newMeeting.day })
                  .andWhere('term = :ciTerm', {
                    ciTerm: testCourseInstance.semester.term,
                  })
                  .andWhere('"calendarYear" = :ciYear', {
                    ciYear: testCourseInstance.semester.academicYear,
                  })
                  .andWhere('day = :roomDay', {
                    roomDay: newMeeting.day,
                  })
                  .andWhere(
                    '(:startTime::TIME, :endTime::TIME) OVERLAPS ("startTime", "endTime")',
                    {
                      startTime: newMeeting.startTime,
                      endTime: newMeeting.endTime,
                    }
                  );
                const { meetingTitles } = await roomBookingQuery.getRawOne();
                const errorResponse = response.body.message as string;
                strictEqual(Array.isArray(meetingTitles), true);
                strictEqual(meetingTitles.length > 0, true);
                strictEqual(
                  errorResponse.includes(meetingTitles),
                  true
                );
              });
            });
            context('When there is no room', function () {
              beforeEach(async function () {
                ([
                  ...otherMeetings
                ] = testCourseInstance.meetings);
                newMeeting = new Meeting();
                newMeeting.day = DAY.FRI;
                newMeeting.startTime = '10:00:00';
                newMeeting.endTime = '16:00:00';
                newMeeting.room = null;
                response = await request(api)
                  .put(`/api/meetings/${testCourseInstance.id}`)
                  .send({
                    meetings: [
                      ...otherMeetings,
                      newMeeting,
                    ].map(({ room, ...mtg }) => ({
                      ...mtg, roomId: room?.id,
                    })),
                  });
                result = response.body;
                const otherIds = otherMeetings.map(({ id }) => id);
                savedMeeting = result
                  .find(({ id }) => (!otherIds.includes(id)));
              });
              it('Should include the new meeting in the result', function () {
                strictEqual(savedMeeting.day, newMeeting.day);
                const newStartTime = new PGTime(
                  newMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, newStartTime);
                const newEndTime = new PGTime(
                  newMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, newEndTime);
                strictEqual(savedMeeting.room, null);
              });
              it('Should add the new meeting in the database', async function () {
                const dbMeeting = await meetingRepository.findOne(
                  savedMeeting.id,
                  { relations: ['room'] }
                );
                strictEqual(dbMeeting.day, newMeeting.day);
                strictEqual(dbMeeting.startTime, newMeeting.startTime);
                strictEqual(dbMeeting.endTime, newMeeting.endTime);
                strictEqual(dbMeeting.room, null);
              });
            });
          });
          context('removing a meeting', function () {
            let meetingToRemove: Meeting;
            let otherMeetings: Meeting[];
            beforeEach(async function () {
              ([
                meetingToRemove,
                ...otherMeetings
              ] = testCourseInstance.meetings);
              response = await request(api)
                .put(`/api/meetings/${testCourseInstance.id}`)
                .send({
                  meetings: otherMeetings
                    .map(({ room, ...mtg }) => ({ ...mtg, roomId: room?.id })),
                });
              result = response.body;
            });
            it('Should not return the meeting in the results', function () {
              const removedMeetingIndex = result
                .findIndex(({ id }) => id === meetingToRemove.id);
              strictEqual(removedMeetingIndex, -1);
            });
            it('Should remove the meeeting in the database', async function () {
              const savedInstance = await courseInstanceRepository
                .findOne(
                  testCourseInstance.id,
                  { relations: ['meetings', 'meetings.room'] }
                );
              deepStrictEqual(savedInstance.meetings, otherMeetings);
            });
          });
          context('removing all meetings', function () {
            beforeEach(async function () {
              response = await request(api)
                .put(`/api/meetings/${testCourseInstance.id}`)
                .send({ meetings: [] });
              result = response.body;
            });
            it('Should return an empty array', function () {
              deepStrictEqual(result, []);
            });
            it('Should delete all the entries in the database', async function () {
              const savedInstance = await courseInstanceRepository
                .findOne(testCourseInstance.id, { relations: ['meetings'] });
              deepStrictEqual(savedInstance.meetings, []);
            });
          });
        });
      });
      context('Updating a non-class event', function () {
        let testNonClassEvent: NonClassEvent;
        let newMeetings: MeetingRequestDTO[];
        context('When there are no existing meetings', function () {
          beforeEach(async function () {
            const getMeetinglessEvent = nonClassEventRepository
              .createQueryBuilder('nce')
              .where('m.id IS NULL')
              .leftJoinAndSelect(Meeting, 'm', 'm."nonClassEventId" = nce.id');

            (testNonClassEvent = await getMeetinglessEvent.getOne());
          });
          context('adding new meetings', function () {
            beforeEach(async function () {
              newMeetings = [
                dummy.mondayMeetingWithRoom,
                dummy.wednesdayMeetingWithRoom,
              ];

              response = await request(api)
                .put(`/api/meetings/${testNonClassEvent.id}`)
                .send({ meetings: newMeetings });
              result = response.body;
            });
            it('Should save the meetings as part of the nonClassEvent', async function () {
              const savedMeetings = await meetingRepository
                .find({
                  where: `"nonClassEventId"='${testNonClassEvent.id}'`,
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
                .createQueryBuilder('m')
                .where(
                  '"nonClassEventId"=:nceid',
                  { nceid: testNonClassEvent.id }
                )
                .orderBy('day', 'ASC')
                .addOrderBy('"startTime"', 'ASC')
                .addOrderBy('"endTime"', 'ASC')
                .leftJoinAndMapOne('m.room', RoomListingView, 'r', 'r.id=m."roomId"')
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
            const allEvents = await nonClassEventRepository
              .find({ relations: ['semester', 'meetings', 'meetings.room'] });
            (testNonClassEvent = allEvents.find(
              ({ meetings }) => meetings
              && meetings.length > 0
              && meetings.every((mtg) => 'room' in mtg)
            ));
          });
          context('Updating an existing meeting', function () {
            let meetingToEdit: Meeting;
            let updatedMeeting: Meeting;
            let savedMeeting: MeetingResponseDTO;
            let otherMeetings: Meeting[];
            context('With the same room', function () {
              beforeEach(async function () {
                ([
                  meetingToEdit,
                  ...otherMeetings
                ] = testNonClassEvent.meetings);
                updatedMeeting = new Meeting();
                Object.assign(updatedMeeting, meetingToEdit);
                updatedMeeting.day = DAY.THU;
                updatedMeeting.startTime = '10:00:00';
                updatedMeeting.endTime = '16:00:00';
                response = await request(api)
                  .put(`/api/meetings/${testNonClassEvent.id}`)
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
                const updatedStartTime = new PGTime(
                  updatedMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, updatedStartTime);
              });
              it('Should update the meeting endTime', function () {
                const updatedEndTime = new PGTime(
                  updatedMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, updatedEndTime);
              });
              it('Should not change the room', function () {
                strictEqual(savedMeeting.room.id, meetingToEdit.room.id);
              });
            });
            context('With a different room', function () {
              context('When the room is available', function () {
                let unbookedRoom: Room;
                beforeEach(async function () {
                  ([
                    meetingToEdit,
                    ...otherMeetings
                  ] = testNonClassEvent.meetings);
                  updatedMeeting = new Meeting();
                  Object.assign(updatedMeeting, meetingToEdit);
                  updatedMeeting.day = DAY.MON;
                  updatedMeeting.startTime = '10:00:00';
                  updatedMeeting.endTime = '16:00:00';
                  const unbookedRoomQuery = roomRepository
                    .createQueryBuilder('r')
                    .where('r.id <> :roomId', { roomId: updatedMeeting.room.id })
                    .andWhere('"meetingTitle" IS NULL')
                    .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.MON}'`);
                  unbookedRoom = await unbookedRoomQuery
                    .getOne();
                  updatedMeeting.room = unbookedRoom;
                  response = await request(api)
                    .put(`/api/meetings/${testNonClassEvent.id}`)
                    .send({
                      meetings: [
                        updatedMeeting,
                        ...otherMeetings,
                      ].map(({ room, ...mtg }) => ({
                        ...mtg, roomId: room?.id,
                      })),
                    });
                  result = response.body;
                  savedMeeting = result
                    .find(({ id }) => id === meetingToEdit.id);
                });
                it('Should update the meeting day', function () {
                  strictEqual(savedMeeting.day, updatedMeeting.day);
                });
                it('Should update the meeting startTime', function () {
                  const updatedStartTime = new PGTime(
                    updatedMeeting.startTime
                  ).displayTime;
                  strictEqual(savedMeeting.startTime, updatedStartTime);
                });
                it('Should update the meeting endTime', function () {
                  const updatedEndTime = new PGTime(
                    updatedMeeting.endTime
                  ).displayTime;
                  strictEqual(savedMeeting.endTime, updatedEndTime);
                });
                it('Should change the room', function () {
                  strictEqual(savedMeeting.room.id, unbookedRoom.id);
                  notStrictEqual(savedMeeting.room.id, meetingToEdit.room.id);
                  notStrictEqual(savedMeeting.room, undefined);
                });
              });
              context('When the room is already booked', function () {
                let bookedRoom: Room;
                beforeEach(async function () {
                  ([
                    meetingToEdit,
                    ...otherMeetings
                  ] = testNonClassEvent.meetings);
                  updatedMeeting = new Meeting();
                  Object.assign(updatedMeeting, meetingToEdit);
                  updatedMeeting.day = DAY.MON;
                  updatedMeeting.startTime = '10:00:00';
                  updatedMeeting.endTime = '16:00:00';
                  const bookedRoomQuery = roomRepository
                    .createQueryBuilder('r')
                    .where('r.id <> :roomId', { roomId: updatedMeeting.room.id })
                    .andWhere('"meetingTitle" IS NOT NULL')
                    .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.MON}'`);
                  bookedRoom = await bookedRoomQuery
                    .getOne();
                  updatedMeeting.room = bookedRoom;
                  response = await request(api)
                    .put(`/api/meetings/${testNonClassEvent.id}`)
                    .send({
                      meetings: [
                        updatedMeeting,
                        ...otherMeetings,
                      ].map(({ room, ...mtg }) => ({
                        ...mtg, roomId: room?.id,
                      })),
                    });
                });
                it('Should return a Bad Request error', function () {
                  strictEqual(response.status, HttpStatus.BAD_REQUEST);
                });
                it('Should list the meetings that have the room booked', async function () {
                  const roomBookingQuery = roomBookingInfoRepository
                    .createQueryBuilder()
                    .select('array_agg("meetingTitle")', 'meetingTitles')
                    .groupBy('"roomId"')
                    .addGroupBy('"calendarYear"')
                    .addGroupBy('term')
                    .addGroupBy('day')
                    .where('"roomId" = :roomId', { roomId: updatedMeeting.room.id })
                    .andWhere('day = :roomDay', { roomDay: updatedMeeting.day })
                    .andWhere('term = :nceTerm', {
                      nceTerm: testNonClassEvent.semester.term,
                    })
                    .andWhere('"calendarYear" = :nceYear', {
                      nceYear: testNonClassEvent.semester.academicYear,
                    })
                    .andWhere('day = :roomDay', {
                      roomDay: updatedMeeting.day,
                    })
                    .andWhere(
                      '(:startTime::TIME, :endTime::TIME) OVERLAPS ("startTime", "endTime")',
                      {
                        startTime: updatedMeeting.startTime,
                        endTime: updatedMeeting.endTime,
                      }
                    );
                  const { meetingTitles } = await roomBookingQuery.getRawOne();
                  const errorResponse = response.body.message as string;
                  strictEqual(Array.isArray(meetingTitles), true);
                  strictEqual(meetingTitles.length > 0, true);
                  strictEqual(
                    errorResponse.includes(meetingTitles),
                    true
                  );
                });
              });
            });
            context('Removing the room', function () {
              beforeEach(async function () {
                ([
                  meetingToEdit,
                  ...otherMeetings
                ] = testNonClassEvent.meetings);
                updatedMeeting = new Meeting();
                Object.assign(updatedMeeting, meetingToEdit);
                updatedMeeting.day = DAY.MON;
                updatedMeeting.startTime = '10:00:00';
                updatedMeeting.endTime = '16:00:00';
                updatedMeeting.room = null;
                response = await request(api)
                  .put(`/api/meetings/${testNonClassEvent.id}`)
                  .send({
                    meetings: [
                      updatedMeeting,
                      ...otherMeetings,
                    ].map(({ room, ...mtg }) => ({ ...mtg, roomId: room?.id })),
                  });
                result = response.body;
                savedMeeting = result
                  .find(({ id }) => id === meetingToEdit.id);
              });
              it('Should update the meeting day', function () {
                strictEqual(savedMeeting.day, updatedMeeting.day);
              });
              it('Should update the meeting startTime', function () {
                const updatedStartTime = new PGTime(
                  updatedMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, updatedStartTime);
              });
              it('Should update the meeting endTime', function () {
                const updatedEndTime = new PGTime(
                  updatedMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, updatedEndTime);
              });
              it('Should blank the room', function () {
                strictEqual(savedMeeting.room, null);
              });
            });
          });
          context('Adding a new meeting', function () {
            let newMeeting: Meeting;
            let otherMeetings: Meeting[];
            let savedMeeting: MeetingResponseDTO;
            context('When the room is available', function () {
              let unbookedRoom: Room;
              beforeEach(async function () {
                ([
                  ...otherMeetings
                ] = testNonClassEvent.meetings);
                newMeeting = new Meeting();
                newMeeting.day = DAY.THU;
                newMeeting.startTime = '10:00:00';
                newMeeting.endTime = '16:00:00';
                const unbookedRoomQuery = roomRepository
                  .createQueryBuilder('r')
                  .where('"meetingTitle" IS NULL')
                  .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.THU}'`);
                unbookedRoom = await unbookedRoomQuery
                  .getOne();
                newMeeting.room = unbookedRoom;
                response = await request(api)
                  .put(`/api/meetings/${testNonClassEvent.id}`)
                  .send({
                    meetings: [
                      ...otherMeetings,
                      newMeeting,
                    ].map(({ room, ...mtg }) => ({
                      ...mtg, roomId: room?.id,
                    })),
                  });
                result = response.body;
                const otherIds = otherMeetings.map(({ id }) => id);
                savedMeeting = result
                  .find(({ id }) => (!otherIds.includes(id)));
              });
              it('Should include the new meeting in the result', function () {
                strictEqual(savedMeeting.day, newMeeting.day);
                const newStartTime = new PGTime(
                  newMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, newStartTime);
                const newEndTime = new PGTime(
                  newMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, newEndTime);
                strictEqual(savedMeeting.room.id, newMeeting.room.id);
              });
              it('Should add the new meeting in the database', async function () {
                const dbMeeting = await meetingRepository.findOne(
                  savedMeeting.id,
                  { relations: ['room'] }
                );
                strictEqual(dbMeeting.day, newMeeting.day);
                strictEqual(dbMeeting.startTime, newMeeting.startTime);
                strictEqual(dbMeeting.endTime, newMeeting.endTime);
                strictEqual(dbMeeting.room.id, newMeeting.room.id);
              });
            });
            context('When the room is already booked', function () {
              let bookedRoom: Room;
              beforeEach(async function () {
                ([
                  ...otherMeetings
                ] = testNonClassEvent.meetings);
                newMeeting = new Meeting();
                newMeeting.day = DAY.FRI;
                newMeeting.startTime = '10:00:00';
                newMeeting.endTime = '16:00:00';
                const bookedRoomQuery = roomRepository
                  .createQueryBuilder('r')
                  .where('"meetingTitle" IS NOT NULL')
                  .leftJoin(RoomBookingInfoView, 'rb', `rb.roomId = r.id AND rb.day = '${DAY.FRI}'`);
                bookedRoom = await bookedRoomQuery
                  .getOne();
                newMeeting.room = bookedRoom;
                response = await request(api)
                  .put(`/api/meetings/${testNonClassEvent.id}`)
                  .send({
                    meetings: [
                      ...otherMeetings,
                      newMeeting,
                    ].map(({ room, ...mtg }) => ({
                      ...mtg, roomId: room?.id,
                    })),
                  });
              });
              it('Should return a Bad Request error', function () {
                strictEqual(response.status, HttpStatus.BAD_REQUEST);
              });
              it('Should list the meetings that have the room booked', async function () {
                const roomBookingQuery = roomBookingInfoRepository
                  .createQueryBuilder()
                  .select('array_agg("meetingTitle")', 'meetingTitles')
                  .groupBy('"roomId"')
                  .addGroupBy('"calendarYear"')
                  .addGroupBy('term')
                  .addGroupBy('day')
                  .where('"roomId" = :roomId', { roomId: newMeeting.room.id })
                  .andWhere('day = :roomDay', { roomDay: newMeeting.day })
                  .andWhere('term = :nceTerm', {
                    nceTerm: testNonClassEvent.semester.term,
                  })
                  .andWhere('"calendarYear" = :nceYear', {
                    nceYear: testNonClassEvent.semester.academicYear,
                  })
                  .andWhere('day = :roomDay', {
                    roomDay: newMeeting.day,
                  })
                  .andWhere(
                    '(:startTime::TIME, :endTime::TIME) OVERLAPS ("startTime", "endTime")',
                    {
                      startTime: newMeeting.startTime,
                      endTime: newMeeting.endTime,
                    }
                  );
                const { meetingTitles } = await roomBookingQuery.getRawOne();
                const errorResponse = response.body.message as string;
                strictEqual(Array.isArray(meetingTitles), true);
                strictEqual(meetingTitles.length > 0, true);
                strictEqual(
                  errorResponse.includes(meetingTitles),
                  true
                );
              });
            });
            context('When there is no room', function () {
              beforeEach(async function () {
                ([
                  ...otherMeetings
                ] = testNonClassEvent.meetings);
                newMeeting = new Meeting();
                newMeeting.day = DAY.FRI;
                newMeeting.startTime = '10:00:00';
                newMeeting.endTime = '16:00:00';
                newMeeting.room = null;
                response = await request(api)
                  .put(`/api/meetings/${testNonClassEvent.id}`)
                  .send({
                    meetings: [
                      ...otherMeetings,
                      newMeeting,
                    ].map(({ room, ...mtg }) => ({
                      ...mtg, roomId: room?.id,
                    })),
                  });
                result = response.body;
                const otherIds = otherMeetings.map(({ id }) => id);
                savedMeeting = result
                  .find(({ id }) => (!otherIds.includes(id)));
              });
              it('Should include the new meeting in the result', function () {
                strictEqual(savedMeeting.day, newMeeting.day);
                const newStartTime = new PGTime(
                  newMeeting.startTime
                ).displayTime;
                strictEqual(savedMeeting.startTime, newStartTime);
                const newEndTime = new PGTime(
                  newMeeting.endTime
                ).displayTime;
                strictEqual(savedMeeting.endTime, newEndTime);
                strictEqual(savedMeeting.room, null);
              });
              it('Should add the new meeting in the database', async function () {
                const dbMeeting = await meetingRepository.findOne(
                  savedMeeting.id,
                  { relations: ['room'] }
                );
                strictEqual(dbMeeting.day, newMeeting.day);
                strictEqual(dbMeeting.startTime, newMeeting.startTime);
                strictEqual(dbMeeting.endTime, newMeeting.endTime);
                strictEqual(dbMeeting.room, null);
              });
            });
          });
          context('removing a meeting', function () {
            let meetingToRemove: Meeting;
            let otherMeetings: Meeting[];
            beforeEach(async function () {
              ([
                meetingToRemove,
                ...otherMeetings
              ] = testNonClassEvent.meetings);
              response = await request(api)
                .put(`/api/meetings/${testNonClassEvent.id}`)
                .send({
                  meetings: otherMeetings
                    .map(({ room, ...mtg }) => ({ ...mtg, roomId: room?.id })),
                });
              result = response.body;
            });
            it('Should not return the meeting in the results', function () {
              const removedMeetingIndex = result
                .findIndex(({ id }) => id === meetingToRemove.id);
              strictEqual(removedMeetingIndex, -1);
            });
            it('Should remove the meeeting in the database', async function () {
              const savedInstance = await nonClassEventRepository
                .findOne(
                  testNonClassEvent.id,
                  { relations: ['meetings', 'meetings.room'] }
                );
              deepStrictEqual(savedInstance.meetings, otherMeetings);
            });
          });
          context('removing all meetings', function () {
            beforeEach(async function () {
              response = await request(api)
                .put(`/api/meetings/${testNonClassEvent.id}`)
                .send({ meetings: [] });
              result = response.body;
            });
            it('Should return an empty array', function () {
              deepStrictEqual(result, []);
            });
            it('Should delete all the entries in the database', async function () {
              const savedInstance = await nonClassEventRepository
                .findOne(testNonClassEvent.id, { relations: ['meetings'] });
              deepStrictEqual(savedInstance.meetings, []);
            });
          });
        });
      });
      context('With an invalid id', function () {
        let invalidId: string;
        beforeEach(async function () {
          ({ id: invalidId } = await meetingRepository.findOne());
          response = await request(api)
            .put(`/api/meetings/${invalidId}`)
            .send({
              meetings: [],
            });
          result = response.body;
        });
        it('Should return a NotFound error', function () {
          strictEqual(response.status, HttpStatus.NOT_FOUND);
        });
        it('Should include that invalid id in the error message', function () {
          const invalidIdRE = new RegExp(invalidId);
          strictEqual(invalidIdRE.test(response.body.message), true);
        });
      });
      context('With no id', function () {
        let invalidId: string;
        beforeEach(async function () {
          invalidId = '';
          response = await request(api)
            .put(`/api/meetings/${invalidId}`)
            .send({
              meetings: [],
            });
          result = response.body;
        });
        it('Should return a NotFound error', function () {
          strictEqual(response.status, HttpStatus.NOT_FOUND);
        });
      });
    });
    context('When not an admin', function () {
      beforeEach(function () {
        authStub.resolves(dummy.regularUser);
      });
      context('Updating a Course Instance', function () {
        let testCourseInstance: CourseInstance;
        beforeEach(async function () {
          (testCourseInstance = await courseInstanceRepository.findOne());
          response = await request(api)
            .put(`/api/meetings/${testCourseInstance.id}`)
            .send({
              meetings: [],
            });
        });
        it('Should return a forbidden error', function () {
          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
      context('Updating a NonClassEvent', function () {
        let testNonClassEvent: NonClassEvent;
        beforeEach(async function () {
          (testNonClassEvent = await nonClassEventRepository.findOne());
          response = await request(api)
            .put(`/api/meetings/${testNonClassEvent.id}`)
            .send({
              meetings: [],
            });
        });
        it('Should return a forbidden error', function () {
          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
});
