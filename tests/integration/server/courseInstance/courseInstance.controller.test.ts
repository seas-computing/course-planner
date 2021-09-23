import { Test, TestingModule } from '@nestjs/testing';
import { SessionModule } from 'nestjs-session';
import { stub, SinonStub } from 'sinon';
import request, { Response } from 'supertest';
import {
  Repository, Not, In, EntityNotFoundError,
} from 'typeorm';
import {
  HttpStatus,
  HttpServer,
  BadRequestException,
} from '@nestjs/common';
import {
  strictEqual,
  deepStrictEqual,
  notStrictEqual,
  rejects,
} from 'assert';
import {
  TypeOrmModule,
  TypeOrmModuleOptions,
  getRepositoryToken,
} from '@nestjs/typeorm';
import { AUTH_MODE, TERM, DAY } from 'common/constants';
import { ConfigService } from 'server/config/config.service';
import { ConfigModule } from 'server/config/config.module';
import { AuthModule } from 'server/auth/auth.module';
import { Meeting } from 'server/meeting/meeting.entity';
import { CourseInstanceModule } from 'server/courseInstance/courseInstance.module';
import { SemesterModule } from 'server/semester/semester.module';
import * as dummy from 'testData';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { ScheduleViewResponseDTO } from 'common/dto/schedule/schedule.dto';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import MockDB from '../../../mocks/database/MockDB';
import { PopulationModule } from '../../../mocks/database/population/population.module';
import { PGTime } from '../../../../src/common/utils/PGTime';
import { CourseInstance } from '../../../../src/server/courseInstance/courseinstance.entity';
import { Faculty } from '../../../../src/server/faculty/faculty.entity';
import { FacultyCourseInstance } from '../../../../src/server/courseInstance/facultycourseinstance.entity';
import { FacultyListingView } from '../../../../src/server/faculty/FacultyListingView.entity';
import { InstructorRequestDTO } from '../../../../src/common/dto/courses/InstructorRequest.dto';

describe('CourseInstance API', function () {
  let testModule: TestingModule;
  let db: MockDB;
  let meetingRepository: Repository<Meeting>;
  let facultyRepository: Repository<Faculty>;
  let fciRepository: Repository<FacultyCourseInstance>;
  let api: HttpServer;
  let authStub: SinonStub;

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
        SemesterModule,
        CourseInstanceModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(db.connectionEnv))
      .compile();
    meetingRepository = testModule.get(getRepositoryToken(Meeting));
    facultyRepository = testModule.get(getRepositoryToken(Faculty));
    fciRepository = testModule.get(getRepositoryToken(FacultyCourseInstance));
    const nestApp = await testModule
      .createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    api = nestApp.getHttpServer() as HttpServer;
  });

  afterEach(async function () {
    await testModule.close();
  });

  describe('GET /schedule', function () {
    context('As unauthenticated user', function () {
      let response: Response;

      beforeEach(function () {
        authStub.resolves(null);
      });

      context('With invalid term', function () {
        const testTerm = 'foo' as TERM;
        const testYear = '2019';
        let result: BadRequestException;
        beforeEach(async function () {
          response = await request(api)
            .get(`/api/course-instances/schedule?term=${testTerm}&year=${testYear}`);
          result = response.body;
        });
        it('Should return a 400 status', function () {
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });

        it('Should return JSON', function () {
          strictEqual(response.type, 'application/json');
        });

        it('Should return an error message', function () {
          deepStrictEqual(
            result.message,
            `"term" must be "${Object.values(TERM).join('" or "')}"`
          );
        });
      });

      context('With invalid year', function () {
        const testTerm = TERM.FALL;
        const testYear = '1920';
        let result: ScheduleViewResponseDTO[];

        beforeEach(async function () {
          response = await request(api)
            .get(`/api/course-instances/schedule?term=${testTerm}&year=${testYear}`);
          result = response.body;
        });

        it('Should return a 200 status', function () {
          strictEqual(response.status, HttpStatus.OK);
        });

        it('Should return JSON', function () {
          strictEqual(response.type, 'application/json');
        });

        it('Should return an empty array', function () {
          deepStrictEqual(result, []);
        });
      });

      context('With an invalid year AND an invalid term', function () {
        const testTerm = 'foo' as TERM;
        const testYear = '1920';
        let result: BadRequestException;
        beforeEach(async function () {
          response = await request(api)
            .get(`/api/course-instances/schedule?term=${testTerm}&year=${testYear}`);
          result = response.body;
        });
        it('Should return a 400 status', function () {
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });

        it('Should return JSON', function () {
          strictEqual(response.type, 'application/json');
        });

        it('Should return an error message', function () {
          deepStrictEqual(
            result.message,
            `"term" must be "${Object.values(TERM).join('" or "')}"`
          );
        });
      });

      context('With valid year and term', function () {
        const testTerm = TERM.FALL;
        const testYear = '2019';
        let result: ScheduleViewResponseDTO[];

        beforeEach(async function () {
          response = await request(api)
            .get(`/api/course-instances/schedule?term=${testTerm}&year=${testYear}`);
          result = response.body;
        });

        it('Should return a 200 status', function () {
          strictEqual(response.status, HttpStatus.OK);
        });

        it('Should return JSON', function () {
          strictEqual(response.type, 'application/json');
        });

        it('Should return a nonempty array of data', function () {
          strictEqual(Array.isArray(result), true);
          notStrictEqual(result.length, 0);
        });

        it('Should only include blocks that have courses', function () {
          result.forEach(({ courses }) => {
            strictEqual(Array.isArray(courses), true);
            notStrictEqual(courses.length, 0);
          });
        });

        describe('Time Formatting', function () {
          it('Should only include course meetings with the same start and end time in each block', async function () {
            return Promise.all(
              result.map(async ({
                startHour,
                startMinute,
                endHour,
                endMinute,
                courses,
              }) => Promise.all(courses.map(async ({ id }) => {
                const {
                  startTime,
                  endTime,
                } = await meetingRepository.findOne(id);
                const pgStartTime = new PGTime(startTime);
                const pgEndTime = new PGTime(endTime);
                strictEqual(pgStartTime.hour, startHour, `Meeting ${id} startHour doesn't match`);
                strictEqual(pgStartTime.minute, startMinute, `Meeting ${id} startMinute doesn't match`);
                strictEqual(pgEndTime.hour, endHour, `Meeting ${id} endHour doesn't match`);
                strictEqual(pgEndTime.minute, endMinute, `Meeting ${id} endMinute doesn't match`);
              })))
            );
          });

          it('Should provide the startHour in 24-hour format', async function () {
            return Promise.all(
              result.map(async ({ startHour, courses }) => {
                const { id } = courses[0];
                const { startTime } = await meetingRepository.findOne(id);
                const { hour } = new PGTime(startTime);
                strictEqual(startHour, hour);
              })
            );
          });

          it('Should provide the endHour in 24-hour format', async function () {
            return Promise.all(
              result.map(async ({ endHour, courses }) => {
                const { id } = courses[0];
                const { endTime } = await meetingRepository.findOne(id);
                const { hour } = new PGTime(endTime);
                strictEqual(endHour, hour);
              })
            );
          });

          it('Should calculate the duration', async function () {
            return Promise.all(
              result.map(async ({ courses, duration }) => {
                const { id } = courses[0];
                const { startTime, endTime } = await meetingRepository
                  .findOne(id);
                const pgStartTime = new PGTime(startTime);
                const pgEndTime = new PGTime(endTime);
                const expected = (pgEndTime.msSinceMidnight
                  - pgStartTime.msSinceMidnight)
                  / 60 / 1000;
                strictEqual(duration, expected);
              })
            );
          });

          it('Should generate a unique id', function () {
            result.forEach(({
              id,
              startHour,
              startMinute: numStartMinute,
              endHour,
              endMinute: numEndMinute,
              coursePrefix,
              weekday,
            }) => {
              // A little hacky, but our original id generation in SQL is using 00
              // so we need to tweak it for the test to run with what we have here
              const startMinute = numStartMinute === 0 ? '00' : numStartMinute;
              const endMinute = numEndMinute === 0 ? '00' : numEndMinute;
              const expectedBlockId = `${coursePrefix}${weekday}${startHour}${startMinute}${endHour}${endMinute}${TERM.FALL}2019`;
              strictEqual(id, expectedBlockId);
            });
          });
        });

        describe('ordering', function () {
        /*
         * The order of these results is particularly important, as it
         * will affect how the blocks are placed in the schedule grid.
         * We're using nested Maps, instead of something like lodash.groupBy,
         * specifically because Maps are iterable preserve order of insertion
         */
          it('Should order ascending chronologically by DAY first', function () {
            const dayMap = new Map();
            // Find the first instance of each day in the results
            Object.values(DAY).forEach((day) => {
              dayMap.set(
                day,
                result.findIndex(({ weekday }) => weekday === day)
              );
            });
            // ensure all days are present
            Object.entries(dayMap).forEach(([day, first]) => {
              notStrictEqual(first, -1, `${day} is not present`);
            });
            // Check the ordering
            strictEqual(
              dayMap.get(DAY.MON) < dayMap.get(DAY.TUE),
              true,
              'TUE appears before MON'
            );
            strictEqual(
              dayMap.get(DAY.TUE) < dayMap.get(DAY.WED),
              true,
              'WED appears before TUE'
            );
            strictEqual(
              dayMap.get(DAY.WED) < dayMap.get(DAY.THU),
              true,
              'THU appears before WED'
            );
            strictEqual(
              dayMap.get(DAY.THU) < dayMap.get(DAY.FRI),
              true,
              'FRI appears before THU'
            );
          });

          it('should order ascending numerically by startHour second', function () {
          // split the list into days
            const dayMap = new Map<DAY, ScheduleViewResponseDTO[]>();
            Object.values(DAY).forEach((day) => {
              dayMap.set(day, result.filter(({ weekday }) => weekday === day));
            });
            // ensure each day has multiple blocks, and then make sure each hour is
            // greater than or equal to the previous
            let numTestsRun = 0;
            dayMap.forEach((list, day) => {
              strictEqual(list.length > 1, true, `${day} only has one block`);
              for (let i = 1; i < list.length; i++) {
                const blockA = list[i - 1];
                const blockB = list[i];
                strictEqual(
                  blockB.startHour >= blockA.startHour,
                  true,
                  `${blockB.id} appears before ${blockA.id}`
                );
                numTestsRun += 1;
              }
            });
            strictEqual(
              numTestsRun > 0,
              true,
              'Tests did not run, possibly because data does not include multiple blocks in the same day'
            );
          });

          it('Should order ascending numerically by startMinute third', function () {
          // split the list into days, then into lists by hour
            const dayMap = new Map<
            DAY,
            Map<number, ScheduleViewResponseDTO[]>
            >();
            Object.values(DAY).forEach((day) => {
              dayMap.set(day, new Map<number, ScheduleViewResponseDTO[]>());
              result.filter(({ weekday }) => weekday === day)
                .forEach((block) => {
                  if (!dayMap.get(day).has(block.startHour)) {
                    dayMap.get(day).set(block.startHour, [block]);
                  } else {
                    dayMap.get(day).get(block.startHour).push(block);
                  }
                });
            });

            // ensure each hour has blocks, and then make sure each minute is
            // greater than or equal to the previous
            let numTestsRun = 0;
            dayMap.forEach((list) => {
              list.forEach((hour) => {
                for (let i = 1; i < hour.length; i++) {
                  const blockA = hour[i - 1];
                  const blockB = hour[i];
                  strictEqual(
                    blockB.startMinute >= blockA.startMinute,
                    true,
                    `${blockB.id} appears before ${blockA.id}`
                  );
                  numTestsRun += 1;
                }
              });
            });
            // Add an additional test to make sure we actually ran some tests
            strictEqual(
              numTestsRun > 0,
              true,
              'Tests did not run, possibly because data does not include multiple blocks in the same hour'
            );
          });

          it('Should order ascending numerically by duration fourth', function () {
          // split the list into a set of nested maps, with keys at the top
          // level for days, then keys at the next level for hours, then keys
          // at the next level for the minutes
            const dayMap = new Map<
            DAY, Map<number, Map<number, ScheduleViewResponseDTO[]>>
            >();
            Object.values(DAY).forEach((day) => {
              dayMap.set(
                day,
                new Map<number, Map<number, ScheduleViewResponseDTO[]>>()
              );
              result.filter(({ weekday }) => weekday === day)
                .forEach((block) => {
                  if (!dayMap.get(day).has(block.startHour)) {
                    dayMap.get(day).set(
                      block.startHour,
                      new Map([[block.startMinute, [block]]])
                    );
                  } else if (!dayMap.get(day)
                    .get(block.startHour)
                    .has(block.startMinute)) {
                    dayMap.get(day)
                      .get(block.startHour)
                      .set(block.startMinute, [block]);
                  } else {
                    dayMap.get(day)
                      .get(block.startHour)
                      .get(block.startMinute)
                      .push(block);
                  }
                });
            });

            // ensure each hour has blocks, and then make sure each minute has
            // blocks and then that each duration is greater than or equal to the
            // previous
            let numTestsRun = 0;
            dayMap.forEach((list) => {
              list.forEach((hour) => {
                hour.forEach((minute) => {
                  for (let i = 1; i < minute.length; i++) {
                    const blockA = minute[i - 1];
                    const blockB = minute[i];
                    strictEqual(
                      blockB.duration >= blockA.duration,
                      true,
                      `${blockB.id} appears before ${blockA.id}`
                    );
                    numTestsRun += 1;
                  }
                });
              });
            });
            // Add an additional test to make sure we actually ran some tests
            strictEqual(
              numTestsRun > 0,
              true,
              'Tests did not run, possibly because data does not include multiple blocks in the same minute'
            );
          });

          it('Should order ascending alphabetically by course Prefix fifth', function () {
          // split the list into a set of nested maps, with keys at the top
          // level for days, then keys at the next level for hours, then keys
          // at the next level for the minutes, then keys at the next level for
          // duration
            const dayMap = new Map<
            DAY,
            Map<number, Map<number, Map<number, ScheduleViewResponseDTO[]
            >>>>();
            Object.values(DAY).forEach((day) => {
              dayMap.set(
                day,
                new Map<
                number, Map<number, Map<number, ScheduleViewResponseDTO[]>>
                >()
              );
              result.filter(({ weekday }) => weekday === day)
                .forEach((block) => {
                  if (!dayMap.get(day).has(block.startHour)) {
                    dayMap.get(day)
                      .set(
                        block.startHour,
                        new Map([[
                          block.startMinute,
                          new Map([[block.duration, [block]]]),
                        ]])
                      );
                  } else if (!dayMap.get(day)
                    .get(block.startHour)
                    .has(block.startMinute)) {
                    dayMap.get(day)
                      .get(block.startHour)
                      .set(
                        block.startMinute,
                        new Map([[block.duration, [block]]])
                      );
                  } else if (!dayMap.get(day)
                    .get(block.startHour)
                    .get(block.startMinute)
                    .has(block.duration)) {
                    dayMap.get(day)
                      .get(block.startHour)
                      .get(block.startMinute)
                      .set(block.duration, [block]);
                  } else {
                    dayMap.get(day)
                      .get(block.startHour)
                      .get(block.startMinute)
                      .get(block.duration)
                      .push(block);
                  }
                });
            });

            // ensure each hour has blocks, then make sure each minute has blocks
            // then that each duration has blocks, and finally check that each
            // block in the duration has a coursePrefix that's greater than or
            // equal to the previous
            let numTestsRun = 0;
            dayMap.forEach((list) => {
              list.forEach((hour) => {
                hour.forEach((minute) => {
                  minute.forEach((duration) => {
                    for (let i = 1; i < duration.length; i++) {
                      const blockA = duration[i - 1];
                      const blockB = duration[i];
                      strictEqual(
                        blockB.coursePrefix >= blockA.coursePrefix,
                        true,
                        `${blockB.id} appears before ${blockA.id}`
                      );
                      numTestsRun += 1;
                    }
                  });
                });
              });
            });
            // Add an additional test to make sure we actually ran some tests
            strictEqual(
              numTestsRun > 0,
              true,
              'Tests did not run, possibly because data does not include multiple blocks in the same duration'
            );
          });

          it('Should order the entries within a block ascending lexicographically by courseNumber', function () {
            let numTestsRun = 0;
            result.forEach(({ id, courses }) => {
              strictEqual(courses.length > 0, true, `block ${id} doens't have any courses`);
              for (let i = 1; i < courses.length; i++) {
                const { courseNumber: first } = courses[i - 1];
                const { courseNumber: second } = courses[i];
                // Make sure we don't have duplicates
                notStrictEqual(first, second, `${first} appears twice in ${id}`);
                strictEqual(second > first, true, `${second} appears before ${first} in ${id}`);
                numTestsRun += 1;
              }
            });
            // Add an additional test to make sure we actually ran some tests
            strictEqual(
              numTestsRun > 0,
              true,
              'Tests did not run, possibly because data does not include multiple courses in the same block'
            );
          });
        });
      });
    });
  });

  describe('PUT /:id/instructors', function () {
    let response: Response;
    let testFaculty: Faculty;
    let testInstance: CourseInstance;
    let assignedInstructors: InstructorRequestDTO[];
    let testAssignmentId: string;
    let originalInstanceAssignments: string[];
    beforeEach(async function () {
      // Find a courseInstance that has multiple faculty
      ({
        id: testAssignmentId,
        faculty: testFaculty,
        courseInstance: testInstance,
      } = await fciRepository.findOne(
        {
          where: {
            order: 1,
          },
          relations: [
            'faculty',
            'faculty.facultyCourseInstances',
            'courseInstance',
            'courseInstance.facultyCourseInstances',
            'courseInstance.facultyCourseInstances.faculty',
          ],
        }
      ));
      // convert Faculty to InstructorRequestDTO's
      assignedInstructors = testInstance.facultyCourseInstances
        .map(({ faculty }) => ({
          id: faculty.id,
          displayName: `${faculty.lastName}, ${faculty.firstName}`,
        }));
      originalInstanceAssignments = testInstance.facultyCourseInstances
        .map(({ id }) => id);
    });
    context('As an admin user', function () {
      beforeEach(function () {
        authStub.resolves(dummy.adminUser);
      });
      describe('Adding an instructor', function () {
        let instructorToAdd: InstructorRequestDTO;
        let originalInstructorAssignments: string[];
        beforeEach(async function () {
          // find a faculty member who is not currently assigned to that
          // course but does have other courses assignments. We need to do this
          // through the facultyCourseInstance Repository, because the
          // facultyRepository doesn't let us query for faculty who have
          // facultyCourseInstance entities associated with them
          const { faculty: dbInstructor } = await fciRepository.findOne({
            where: {
              faculty: {
                id: Not(In(assignedInstructors.map(({ id }) => id))),
              },
            },
            relations: [
              'faculty',
              'faculty.facultyCourseInstances',
            ],
          });
          instructorToAdd = ({
            id: dbInstructor.id,
            displayName: `${dbInstructor.lastName}, ${dbInstructor.firstName}`,
          });
          originalInstructorAssignments = dbInstructor
            .facultyCourseInstances
            .map(({ id }) => id);
        });
        context('To the beginning of the list', function () {
          beforeEach(async function () {
            response = await request(api)
              .put(`/api/course-instances/${testInstance.id}/instructors`)
              .send({
                instructors: [
                  instructorToAdd,
                  ...assignedInstructors,
                ],
              });
          });
          it('Should return OK', function () {
            strictEqual(response.statusCode, HttpStatus.OK);
          });
          it('Should include the new instructor in the correct place in the list', function () {
            const [firstInstructor] = response.body;
            strictEqual(firstInstructor.id, instructorToAdd.id);
          });
          it('Should save the new instructor list in the database', async function () {
            const savedInstructors = await fciRepository.find({
              where: {
                courseInstance: testInstance.id,
              },
              order: {
                order: 'ASC',
              },
              relations: ['faculty'],
            });
            const savedInstructorIds = savedInstructors
              .map(({ faculty }) => faculty.id);
            deepStrictEqual(
              savedInstructorIds,
              [instructorToAdd, ...assignedInstructors].map(({ id }) => id)
            );
          });
          it('Should delete the old instructor assignments from the courseInstance', async function () {
            return Promise.all(
              originalInstanceAssignments
                .map(async (assignmentId) => rejects(
                  () => fciRepository.findOneOrFail(assignmentId),
                  EntityNotFoundError
                ))
            );
          });
          it('Should not delete the other courseInstance assignments from the faculty', async function () {
            const savedAssignments = await fciRepository.find(
              {
                where: {
                  faculty: instructorToAdd.id,
                  courseInstance: Not(testInstance.id),
                },
              }
            );
            notStrictEqual(savedAssignments.length, 0);
            deepStrictEqual(
              savedAssignments
                .map(({ id }) => id)
                .sort(),
              originalInstructorAssignments.sort()
            );
          });
        });
        context('To the end of the list', function () {
          beforeEach(async function () {
            response = await request(api)
              .put(`/api/course-instances/${testInstance.id}/instructors`)
              .send({
                instructors: [
                  ...assignedInstructors,
                  instructorToAdd,
                ],
              });
          });
          it('Should return OK', function () {
            strictEqual(response.statusCode, HttpStatus.OK);
          });
          it('Should include the new instructor in the correct place in the list', function () {
            const lastInstructor = response.body[response.body.length - 1];
            strictEqual(lastInstructor.id, instructorToAdd.id);
          });
          it('Should save the new instructor list in the database', async function () {
            const savedInstructors = await fciRepository.find({
              where: {
                courseInstance: testInstance.id,
              },
              order: {
                order: 'ASC',
              },
              relations: ['faculty'],
            });
            const savedInstructorIds = savedInstructors
              .map(({ faculty }) => faculty.id);
            deepStrictEqual(
              savedInstructorIds,
              ([...assignedInstructors, instructorToAdd]).map(({ id }) => id)
            );
          });
          it('Should delete the old instructor assignments from the courseInstance', async function () {
            return Promise.all(
              originalInstanceAssignments
                .map(async (assignmentId) => rejects(
                  () => fciRepository.findOneOrFail(assignmentId),
                  EntityNotFoundError
                ))
            );
          });
          it('Should not delete the other courseInstance assignments from the faculty', async function () {
            const savedAssignments = await fciRepository.find(
              {
                where: {
                  faculty: instructorToAdd.id,
                  courseInstance: Not(testInstance.id),
                },
              }
            );
            notStrictEqual(savedAssignments.length, 0);
            deepStrictEqual(
              savedAssignments
                .map(({ id }) => id)
                .sort(),
              originalInstructorAssignments.sort()
            );
          });
        });
      });
      describe('Reordering instructors', function () {
        let reorderedInstructors: InstructorRequestDTO[];
        beforeEach(async function () {
          const [
            firstInstructor,
            secondInstructor,
            ...otherInstructors
          ] = assignedInstructors;
          reorderedInstructors = [
            secondInstructor,
            ...otherInstructors,
            firstInstructor,
          ];
          response = await request(api)
            .put(`/api/course-instances/${testInstance.id}/instructors`)
            .send({
              instructors: reorderedInstructors,
            });
        });
        it('Should return OK', function () {
          strictEqual(response.statusCode, HttpStatus.OK);
        });
        it('Should return the instructors in the correct order', function () {
          const returnedInstructorIds = Array.isArray(response.body)
            ? response.body.map(({ id }: FacultyListingView) => id)
            : [];
          deepStrictEqual(
            returnedInstructorIds,
            reorderedInstructors.map(({ id }) => id)
          );
        });
        it('Should save the new instructor list in the database', async function () {
          const savedInstructors = await fciRepository.find({
            where: {
              courseInstance: testInstance.id,
            },
            order: {
              order: 'ASC',
            },
            relations: ['faculty'],
          });
          const savedInstructorIds = savedInstructors
            .map(({ faculty }) => faculty.id);
          deepStrictEqual(
            savedInstructorIds,
            reorderedInstructors.map(({ id }) => id)
          );
        });
        it('Should delete the old instructor assignments from the courseInstance', async function () {
          return Promise.all(
            originalInstanceAssignments
              .map(async (assignmentId) => rejects(
                () => fciRepository.findOneOrFail(assignmentId),
                EntityNotFoundError
              ))
          );
        });
      });
      describe('Removing an instructor', function () {
        let originalInstructorAssignments: string[];
        let testFacultyIndex: number;
        beforeEach(async function () {
          originalInstructorAssignments = testFaculty
            .facultyCourseInstances
            .map(({ id }) => id);
          testFacultyIndex = assignedInstructors
            .findIndex(({ id }) => id === testFaculty.id);
          assignedInstructors.splice(testFacultyIndex, 1);
          response = await request(api)
            .put(`/api/course-instances/${testInstance.id}/instructors`)
            .send({
              instructors: assignedInstructors,
            });
        });
        it('Should return OK', function () {
          strictEqual(response.statusCode, HttpStatus.OK);
        });
        it('Should not include the instructor in the list', function () {
          notStrictEqual(response.body.length, 0);
          const instructorIndex = Array.isArray(response.body)
            ? response.body.findIndex((id) => id === testFaculty.id)
            : null;
          strictEqual(instructorIndex, -1);
        });
        it('Should save the new instructor list in the database', async function () {
          const savedInstructors = await fciRepository.find({
            where: {
              courseInstance: testInstance.id,
            },
            order: {
              order: 'ASC',
            },
            relations: ['faculty'],
          });
          const savedInstructorIds = savedInstructors
            .map(({ faculty }) => faculty.id);
          deepStrictEqual(
            savedInstructorIds,
            assignedInstructors.map(({ id }) => id)
          );
        });
        it('Should delete the old instructor assignments from the courseInstance', async function () {
          return Promise.all(
            originalInstanceAssignments
              .map(async (assignmentId) => rejects(
                () => fciRepository.findOneOrFail(assignmentId),
                EntityNotFoundError
              ))
          );
        });
        it('Should not delete the other courseInstance assignments from the faculty', async function () {
          const savedAssignments = await fciRepository.find(
            {
              where: {
                faculty: testFaculty.id,
              },
              order: {
                id: 'ASC',
              },
            }
          );
          notStrictEqual(savedAssignments.length, 0);
          deepStrictEqual(
            savedAssignments
              .map(({ id }) => id)
              .sort(),
            originalInstructorAssignments
              .filter((id) => id !== testAssignmentId)
              .sort()
          );
        });
      });
      describe('Removing all instructors', function () {
        beforeEach(async function () {
          response = await request(api)
            .put(`/api/course-instances/${testInstance.id}/instructors`)
            .send({
              instructors: [],
            });
        });
        it('Should return OK', function () {
          strictEqual(response.statusCode, HttpStatus.OK);
        });
        it('Should return an empty list', function () {
          strictEqual(response.body.length, 0);
        });
        it('Should delete all instance assignments in the database', async function () {
          const updatedAssignments = await fciRepository.find({
            where: {
              id: In(originalInstanceAssignments),
            },
          });
          strictEqual(updatedAssignments.length, 0);
        });
      });
      describe('With invalid faculty Ids', function () {
        beforeEach(async function () {
          response = await request(api)
            .put(`/api/course-instances/${testInstance.id}/instructors`)
            .send({
              instructors: [{
                displayName: 'user, fake',
                // Send a non-faculty ID
                id: testAssignmentId,
              }],
            });
        });
        it('Should return a NOT_FOUND error', function () {
          strictEqual(response.status, HttpStatus.NOT_FOUND);
        });
        it('Should not change the data in the database', async function () {
          const dbAssignments = await fciRepository.find({
            where: {
              courseInstance: testInstance.id,
            },
            order: {
              id: 'ASC',
            },
          });
          deepStrictEqual(
            dbAssignments.map(({ id }) => id),
            originalInstanceAssignments.sort()
          );
        });
      });
      describe('With invalid courseInstance id', function () {
        beforeEach(async function () {
          response = await request(api)
            .put(`/api/course-instances/${testFaculty.id}/instructors`)
            .send({
              instructors: [],
            });
        });
        it('Should return a NOT_FOUND error', function () {
          strictEqual(response.status, HttpStatus.NOT_FOUND);
        });
      });
    });
    context('As read-only user', function () {
      beforeEach(function () {
        authStub.resolves(dummy.readOnlyUser);
      });
      describe('Trying to remove instructors', function () {
        beforeEach(async function () {
          response = await request(api)
            .put(`/api/course-instances/${testInstance.id}/instructors`)
            .send({
              instructors: [],
            });
        });
        it('Should return a FORBIDDEN Error', function () {
          strictEqual(response.statusCode, HttpStatus.FORBIDDEN);
        });
        it('Should not change the data in the database', async function () {
          const dbAssignments = await fciRepository.find({
            where: {
              courseInstance: testInstance.id,
            },
            order: {
              id: 'ASC',
            },
          });
          deepStrictEqual(
            dbAssignments.map(({ id }) => id),
            originalInstanceAssignments.sort()
          );
        });
      });
    });
    context('As a regular user', function () {
      beforeEach(function () {
        authStub.resolves(dummy.regularUser);
      });
      describe('Trying to remove instructors', function () {
        beforeEach(async function () {
          response = await request(api)
            .put(`/api/course-instances/${testInstance.id}/instructors`)
            .send({
              instructors: [],
            });
        });
        it('Should return a FORBIDDEN Error', function () {
          strictEqual(response.statusCode, HttpStatus.FORBIDDEN);
        });
        it('Should not change the data in the database', async function () {
          const dbAssignments = await fciRepository.find({
            where: {
              courseInstance: testInstance.id,
            },
            order: {
              id: 'ASC',
            },
          });
          deepStrictEqual(
            dbAssignments.map(({ id }) => id),
            originalInstanceAssignments.sort()
          );
        });
      });
    });
  });
});
