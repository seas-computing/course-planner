import {
  ForbiddenException, HttpServer, HttpStatus, ValidationError,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  deepStrictEqual, notDeepStrictEqual, notStrictEqual, strictEqual,
} from 'assert';
import { ABSENCE_TYPE, AUTH_MODE, TERM } from 'common/constants';
import { InstructorResponseDTO } from 'common/dto/courses/InstructorResponse.dto';
import { absenceEnumToTitleCase } from 'common/utils/facultyHelperFunctions';
import { Request, Response } from 'express';
import { SessionModule } from 'nestjs-session';
import { Absence } from 'server/absence/absence.entity';
import { Area } from 'server/area/area.entity';
import { AuthModule } from 'server/auth/auth.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyModule } from 'server/faculty/faculty.module';
import { Semester } from 'server/semester/semester.entity';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import {
  adminUser,
  appliedMathFacultyMember,
  appliedMathFacultyMemberRequest,
  bioengineeringFacultyMember,
  regularUser,
  string,
  uuid,
} from 'testData';
import { In, Repository } from 'typeorm';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { PopulationModule } from '../../../mocks/database/population/population.module';

describe('Faculty API', function () {
  let authStub: SinonStub;
  let api: HttpServer;
  let facultyRepository: Repository<Faculty>;
  let areaRepository: Repository<Area>;
  let testModule: TestingModule;
  let configService: ConfigService;
  beforeEach(async function () {
    authStub = stub(TestingStrategy.prototype, 'login');
    testModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        SessionModule.forRoot({
          session: {
            secret: string,
            resave: true,
            saveUninitialized: true,
          },
        }),
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
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(this.database.connectionEnv))
      .compile();

    facultyRepository = testModule
      .get<Repository<Faculty>>(getRepositoryToken(Faculty));
    areaRepository = testModule
      .get<Repository<Area>>(getRepositoryToken(Area));
    configService = testModule.get<ConfigService>(ConfigService);

    const app = await testModule.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();
    api = app.getHttpServer() as HttpServer<Request, Response>;
  });
  afterEach(async function () {
    await testModule.close();
  });
  describe('GET /faculty', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/faculty');

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      beforeEach(function () {
        authStub.resolves(regularUser);
      });
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.resolves(adminUser);
        });
        it('returns all faculty members in the database', async function () {
          const expectedFacultyCount = await facultyRepository.count({
            relations: ['area'],
          });

          const {
            body: returnedFaculty,
          } = await request(api).get('/api/faculty');

          strictEqual(returnedFaculty.length, expectedFacultyCount);
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

          const response = await request(api).get('/api/faculty');

          const faculty = response.body as Faculty[];
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

          const response = await request(api).get('/api/faculty');
          const actualFaculty = response.body as Faculty[];
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

          const response = await request(api).get('/api/faculty');
          const actualFaculty = response.body as Faculty[];
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
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api).get('/api/faculty');

          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
  describe('GET /faculty/instructors', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api).get('/api/faculty/instructors');

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      beforeEach(function () {
        authStub.resolves(regularUser);
      });
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.resolves(adminUser);
        });
        it('returns all faculty members in the database', async function () {
          const expectedFacultyCount = await facultyRepository.count({
            relations: ['area'],
          });

          const {
            body: returnedFaculty,
          } = await request(api).get('/api/faculty/instructors');

          strictEqual(returnedFaculty.length, expectedFacultyCount);
        });
        it('orders by display name', async function () {
          const facultyRecords = await facultyRepository.find({
            relations: ['area'],
            take: 5, // 🎷🎶
          });

          await facultyRepository.query(`TRUNCATE ${Faculty.name} CASCADE`);
          const newFaculty = await facultyRepository.save(facultyRecords);

          const response = await request(api).get('/api/faculty/instructors');
          const result: InstructorResponseDTO[] = response.body;

          const sortedInstructors = newFaculty.map((
            { area, ...faculty }
          ) => ({
            ...faculty,
            displayName: `${faculty.lastName}, ${faculty.firstName}`,
          })).sort(
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

          deepStrictEqual(
            result.map(({ displayName }) => displayName),
            sortedInstructors.map(({ displayName }) => displayName)
          );
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api).get('/api/faculty/instructors');

          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
  describe('POST /faculty', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api)
          .post('/api/faculty')
          .send(appliedMathFacultyMemberRequest);

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      beforeEach(function () {
        authStub.resolves(regularUser);
      });
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.resolves(adminUser);
        });
        it('creates a new faculty member in the database', async function () {
          await facultyRepository.query(`TRUNCATE ${Faculty.name} CASCADE`);

          const response = await request(api)
            .post('/api/faculty')
            .send(appliedMathFacultyMemberRequest);

          const expectedFacultyCount = await facultyRepository.count();

          strictEqual(response.status, HttpStatus.CREATED);
          strictEqual(expectedFacultyCount, 1);
        });
        it('reports a validation error when HUID is missing', async function () {
          const {
            status,
            body,
          } = await request(api)
            .post('/api/faculty')
            .send({
              firstName: appliedMathFacultyMember.firstName,
              lastName: appliedMathFacultyMember.lastName,
              category: appliedMathFacultyMember.category,
              area: appliedMathFacultyMember.area.name,
            });

          strictEqual(status, HttpStatus.BAD_REQUEST);
          deepStrictEqual(
            (body.message as ValidationError[]).map(({ property }) => property),
            ['HUID']
          );
        });
        it('reports a validation error when category is missing', async function () {
          const {
            status,
            body,
          } = await request(api)
            .post('/api/faculty')
            .send({
              HUID: appliedMathFacultyMember.HUID,
              firstName: appliedMathFacultyMember.firstName,
              lastName: appliedMathFacultyMember.lastName,
              area: appliedMathFacultyMember.area.name,
            });

          strictEqual(status, HttpStatus.BAD_REQUEST);
          deepStrictEqual(
            (body.message as ValidationError[]).map(({ property }) => property),
            ['category']
          );
        });
        it('does not require a first name', async function () {
          const {
            status,
            body,
          } = await request(api)
            .post('/api/faculty')
            .send({
              HUID: appliedMathFacultyMember.HUID,
              category: appliedMathFacultyMember.category,
              lastName: appliedMathFacultyMember.lastName,
              area: appliedMathFacultyMember.area.name,
            });

          strictEqual(status, HttpStatus.CREATED);
          deepStrictEqual(body.HUID, appliedMathFacultyMember.HUID);
        });
        it('requires a last name', async function () {
          const {
            status,
            body,
          } = await request(api)
            .post('/api/faculty')
            .send({
              HUID: appliedMathFacultyMember.HUID,
              category: appliedMathFacultyMember.category,
              firstName: appliedMathFacultyMember.firstName,
              area: appliedMathFacultyMember.area.name,
            });

          strictEqual(status, HttpStatus.BAD_REQUEST);
          deepStrictEqual(
            (body.message as ValidationError[]).map(({ property }) => property),
            ['lastName']
          );
        });
        it('throws a Not Found exception if area does not exist', async function () {
          const {
            status,
            body,
          } = await request(api)
            .post('/api/faculty')
            .send({
              HUID: appliedMathFacultyMember.HUID,
              category: appliedMathFacultyMember.category,
              firstName: appliedMathFacultyMember.firstName,
              lastName: appliedMathFacultyMember.lastName,
              area: string,
            });
          strictEqual(status, HttpStatus.NOT_FOUND);
          strictEqual((body.message as string).includes('Area'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api)
            .post('/api/faculty')
            .send(appliedMathFacultyMemberRequest);

          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
  describe('PUT /faculty/:id', function () {
    let existingFacultyMember: Faculty;
    beforeEach(async function () {
      existingFacultyMember = await facultyRepository.findOne({
        relations: ['area'],
      });
    });
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api)
          .put(`/api/faculty/${existingFacultyMember.id}`)
          .send(existingFacultyMember);

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.resolves(adminUser);
        });
        it('updates a faculty member entry in the database', async function () {
          const { status, body } = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send({
              ...existingFacultyMember,
              lastName: string,
              area: existingFacultyMember.area.name,
            });
          const { updatedAt, ...updatedFaculty } = body;
          const {
            updatedAt: existingFacultyUpdatedAt,
            ...existingFacultyMemberWithoutUpdatedAt
          } = existingFacultyMember;

          strictEqual(status, HttpStatus.OK);
          deepStrictEqual(updatedFaculty, {
            ...existingFacultyMemberWithoutUpdatedAt,
            lastName: string,
            area: { ...existingFacultyMemberWithoutUpdatedAt.area },
          });
          notStrictEqual(updatedAt, existingFacultyMember.updatedAt);
        });
        it('reports a validation error when HUID is missing', async function () {
          const { HUID, ...facultyWithoutHuid } = existingFacultyMember;
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send({
              ...facultyWithoutHuid,
              area: facultyWithoutHuid.area.name,
            });
          strictEqual(status, HttpStatus.BAD_REQUEST);
          deepStrictEqual(
            (body.message as ValidationError[]).map(({ property }) => property),
            ['HUID']
          );
        });
        it('reports a validation error when category is missing', async function () {
          const { category, ...facultyWithoutCategory } = existingFacultyMember;
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send({
              ...facultyWithoutCategory,
              area: facultyWithoutCategory.area.name,
            });

          strictEqual(status, HttpStatus.BAD_REQUEST);
          deepStrictEqual(
            (body.message as ValidationError[]).map(({ property }) => property),
            ['category']
          );
        });
        it('does not require a first name', async function () {
          const {
            firstName,
            ...facultyWithoutFirstName
          } = existingFacultyMember;
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send({
              ...facultyWithoutFirstName,
              area: facultyWithoutFirstName.area.name,
            });

          strictEqual(status, HttpStatus.OK);
          deepStrictEqual(body.HUID, existingFacultyMember.HUID);
        });
        it('requires a last name', async function () {
          const { lastName, ...facultyWithoutLastname } = existingFacultyMember;
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send({
              ...facultyWithoutLastname,
              area: facultyWithoutLastname.area.name,
            });

          strictEqual(status, HttpStatus.BAD_REQUEST);
          deepStrictEqual(
            (body.message as ValidationError[]).map(({ property }) => property),
            ['lastName']
          );
        });
        it('throws a Not Found exception if area does not exist', async function () {
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send({
              ...existingFacultyMember,
              area: string,
            });
          strictEqual(status, HttpStatus.NOT_FOUND);
          strictEqual((body.message as string).includes('Area'), true);
        });
        it('throws a Not Found exception if faculty does not exist', async function () {
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/${uuid}`)
            .send({
              ...existingFacultyMember,
              area: existingFacultyMember.area.name,
            });

          strictEqual(status, HttpStatus.NOT_FOUND);
          strictEqual((body.message as string).includes('Faculty'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api)
            .put(`/api/faculty/${existingFacultyMember.id}`)
            .send(existingFacultyMember);

          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
  describe('PUT /faculty/absence/:id', function () {
    let absenceLastYear: Absence;
    let absenceThisYear: Absence;
    let absenceNextYear: Absence;
    let stubAcademicYear: SinonStub;
    let absenceRepository: Repository<Absence>;
    let lastAcademicYear: number;
    let thisAcademicYear: number;
    let nextAcademicYear: number;
    beforeEach(async function () {
      stubAcademicYear = stub(ConfigService.prototype, 'academicYear');
      stubAcademicYear.get(() => 2021);
      absenceRepository = testModule
        .get<Repository<Absence>>(getRepositoryToken(Absence));
      lastAcademicYear = configService.academicYear - 1;
      thisAcademicYear = configService.academicYear;
      nextAcademicYear = configService.academicYear + 1;
      ([
        absenceLastYear,
        absenceThisYear,
        absenceNextYear,
      ] = await Promise.all([
        lastAcademicYear,
        thisAcademicYear,
        nextAcademicYear,
      ].map((acyr) => absenceRepository.createQueryBuilder('a')
        .select('a.id')
        .addSelect('a.type')
        .addSelect('a.updatedAt')
        .leftJoinAndMapOne(
          'a.semester',
          Semester, 's',
          'a."semesterId" = s."id"'
        )
        .where('s.academicYear=:acyr', { acyr })
        .andWhere('s.term=:term', { term: TERM.SPRING })
        .limit(1)
        .getOne())));
    });
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api)
          .put(`/api/faculty/absence/${absenceThisYear.id}`)
          .send({
            ...absenceThisYear,
            type: ABSENCE_TYPE.TEACHING_RELIEF,
          });

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        let semesterRepository: Repository<Semester>;
        let springAbsence: Absence;
        let fallAbsence: Absence;
        beforeEach(async function () {
          authStub.returns(adminUser);
          semesterRepository = testModule
            .get<Repository<Semester>>(getRepositoryToken(Semester));
          const { id: facultyId } = await facultyRepository.findOne();
          const { id: springId } = await semesterRepository.findOne({
            where: { academicYear: thisAcademicYear, term: TERM.SPRING },
          });
          const { id: fallId } = await semesterRepository.findOne({
            where: { academicYear: lastAcademicYear, term: TERM.FALL },
          });
          fallAbsence = await absenceRepository.findOne({
            select: ['id', 'updatedAt'],
            where: { semester: fallId, faculty: facultyId },
          });
          springAbsence = await absenceRepository.findOne({
            select: ['id', 'updatedAt'],
            relations: ['faculty'],
            where: { semester: springId, faculty: facultyId },
          });
        });
        it('updates the specified absence', async function () {
          const { status } = await request(api)
            .put(`/api/faculty/absence/${absenceThisYear.id}`)
            .send({
              id: absenceThisYear.id,
              type: ABSENCE_TYPE.TEACHING_RELIEF,
            });

          const { type } = await absenceRepository.findOne(
            absenceThisYear.id
          );
          strictEqual(status, HttpStatus.OK);
          strictEqual(type, ABSENCE_TYPE.TEACHING_RELIEF);
        });
        it('throws a Not Found exception if absence does not exist', async function () {
          const { status, body } = await request(api)
            .put(`/api/faculty/absence/${uuid}`)
            .send({
              id: uuid,
              type: absenceThisYear.type,
            });
          strictEqual(status, HttpStatus.NOT_FOUND);
          strictEqual((body.message as string).includes('Absence'), true);
        });
        describe('absences in previous academic years', function () {
          it('cannot be changed', async function () {
            const { status } = await request(api)
              .put(`/api/faculty/absence/${absenceLastYear.id}`)
              .send({
                id: absenceLastYear.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const {
              updatedAt,
            } = await absenceRepository.findOne(
              absenceLastYear.id,
              { select: ['updatedAt'] }
            );
            strictEqual(status, HttpStatus.BAD_REQUEST);
            deepStrictEqual(updatedAt, absenceLastYear.updatedAt);
          });
        });
        describe('absences in the current academic year', function () {
          it('allows modification of absences for fall in the current academic year', async function () {
            const springAbsenceThisYear = await absenceRepository
              .createQueryBuilder('a')
              .leftJoinAndMapOne(
                'a.semester',
                Semester, 's',
                'a."semesterId" = s."id"'
              )
              .where(
                's."academicYear"=:acyr',
                {
                  acyr: thisAcademicYear,
                  term: TERM.FALL,
                }
              )
              .getOne();

            const { status } = await request(api)
              .put(`/api/faculty/absence/${springAbsenceThisYear.id}`)
              .send({
                id: springAbsenceThisYear.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const { updatedAt } = await absenceRepository.findOne(
              springAbsenceThisYear.id,
              { select: ['updatedAt'] }
            );
            strictEqual(status, HttpStatus.OK);
            notStrictEqual(updatedAt, springAbsenceThisYear.updatedAt);
          });
          it('allows modification of absences for spring in the current academic year', async function () {
            const springAbsenceThisYear = await absenceRepository
              .createQueryBuilder('a')
              .leftJoinAndMapOne(
                'a.semester',
                Semester, 's',
                'a."semesterId" = s."id"'
              )
              .where(
                's."academicYear"=:acyr',
                {
                  acyr: thisAcademicYear,
                  term: TERM.SPRING,
                }
              )
              .getOne();

            const { status } = await request(api)
              .put(`/api/faculty/absence/${springAbsenceThisYear.id}`)
              .send({
                id: springAbsenceThisYear.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const { updatedAt } = await absenceRepository.findOne(
              springAbsenceThisYear.id,
              { select: ['updatedAt'] }
            );
            strictEqual(status, HttpStatus.OK);
            notStrictEqual(updatedAt, springAbsenceThisYear.updatedAt);
          });
        });
        describe('absences in future academic years', function () {
          it('allows modification of absences after the current academic year', async function () {
            const { status } = await request(api)
              .put(`/api/faculty/absence/${absenceNextYear.id}`)
              .send({
                id: absenceNextYear.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const {
              updatedAt,
            } = await absenceRepository.findOne(
              absenceNextYear.id,
              { select: ['updatedAt'] }
            );
            strictEqual(status, HttpStatus.OK);
            notDeepStrictEqual(updatedAt, absenceNextYear.updatedAt);
          });
        });
        describe(`changing FROM ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, function () {
          beforeEach(async function () {
            // Update the absence to be longer active
            await absenceRepository.createQueryBuilder('a')
              .update(Absence)
              .set({ type: ABSENCE_TYPE.NO_LONGER_ACTIVE })
              .where({ id: In([springAbsence.id, fallAbsence.id]) })
              .execute();
          });
          it('does not modify past absences', async function () {
            const absencesBeforeUpdate = (await absenceRepository.find({
              select: ['type', 'id'],
              relations: ['semester'],
              where: { faculty: springAbsence.faculty.id },
              order: {
                id: 'ASC',
              },
            }))
              .filter(({ semester }) => parseInt(semester.academicYear, 10)
                < thisAcademicYear);

            await request(api)
              .put(`/api/faculty/absence/${springAbsence.id}`)
              .send({
                id: springAbsence.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });
            const absencesAfterUpdate = await absenceRepository.find({
              select: ['type', 'id'],
              relations: ['semester'],
              where: {
                id: In(absencesBeforeUpdate.map(({ id }) => id)),
              },
              order: {
                id: 'ASC',
              },
            });

            deepStrictEqual(
              absencesBeforeUpdate.map(({ type, id }) => ({ type, id })),
              absencesAfterUpdate.map(({ type, id }) => ({ type, id }))
            );
          });
          it(`sets all future absences to ${absenceEnumToTitleCase(ABSENCE_TYPE.PRESENT)}`, async function () {
            await request(api)
              .put(`/api/faculty/absence/${springAbsence.id}`)
              .send({
                id: springAbsence.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });
            const absences = (await absenceRepository.find({
              select: ['type'],
              relations: ['semester'],
              where: { faculty: springAbsence.faculty.id },
              order: {
                type: 'ASC',
              },
            }))
              .filter(({ semester }) => parseInt(semester.academicYear, 10)
                > thisAcademicYear);

            deepStrictEqual(
              absences.every(({ type }) => type === ABSENCE_TYPE.PRESENT),
              true
            );
          });
          it('only updates spring of the next academic year if editing spring', async function () {
            const fallBeforeUpdate = await absenceRepository.findOne({
              select: ['updatedAt', 'type'],
              where: { id: fallAbsence.id },
            });
            await request(api)
              .put(`/api/faculty/absence/${springAbsence.id}`)
              .send({
                id: springAbsence.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const fallAfterUpdate = await absenceRepository.findOne({
              select: ['id', 'updatedAt', 'createdAt', 'type'],
              where: { id: fallAbsence.id },
            });
            const springAfterUpdate = await absenceRepository.findOne({
              select: ['id', 'updatedAt', 'type'],
              where: { id: springAbsence.id },
            });

            strictEqual(springAfterUpdate.type, ABSENCE_TYPE.PRESENT);
            deepStrictEqual(
              fallAfterUpdate.updatedAt,
              fallBeforeUpdate.updatedAt
            );
          });
          it('updates fall of the current academic year and spring of the next academic year if updating fall', async function () {
            await request(api)
              .put(`/api/faculty/absence/${fallAbsence.id}`)
              .send({
                id: fallAbsence.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const [
              fallAfterUpdate,
              springAfterUpdate,
            ] = await absenceRepository.find({
              relations: ['semester'],
              where: { id: In([springAbsence.id, fallAbsence.id]) },
            });
            strictEqual(fallAfterUpdate.type, ABSENCE_TYPE.PRESENT);
            strictEqual(springAfterUpdate.type, ABSENCE_TYPE.PRESENT);
          });
          it(`does not mark the specified absence as ${absenceEnumToTitleCase(ABSENCE_TYPE.PRESENT)}`, async function () {
            const { status } = await request(api)
              .put(`/api/faculty/absence/${fallAbsence.id}`)
              .send({
                id: fallAbsence.id,
                type: ABSENCE_TYPE.TEACHING_RELIEF,
              });

            const { type } = await absenceRepository.findOne(fallAbsence.id);

            strictEqual(status, HttpStatus.OK);
            strictEqual(type, ABSENCE_TYPE.TEACHING_RELIEF);
          });
        });
        describe(`changing TO ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, function () {
          beforeEach(async function () {
            // Update the absence to be longer active
            await absenceRepository.createQueryBuilder('a')
              .update(Absence)
              .set({ type: ABSENCE_TYPE.PRESENT })
              .where({ id: In([springAbsence.id, fallAbsence.id]) })
              .execute();
          });
          it('does not modify past absences', async function () {
            const absencesBeforeUpdate = (await absenceRepository.find({
              select: ['type', 'id'],
              relations: ['semester'],
              where: { faculty: springAbsence.faculty.id },
              order: {
                id: 'ASC',
              },
            }))
              .filter(({ semester }) => parseInt(semester.academicYear, 10)
                < thisAcademicYear);

            await request(api)
              .put(`/api/faculty/absence/${springAbsence.id}`)
              .send({
                id: springAbsence.id,
                type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
              });
            const absencesAfterUpdate = await absenceRepository.find({
              select: ['type', 'id'],
              relations: ['semester'],
              where: {
                id: In(absencesBeforeUpdate.map(({ id }) => id)),
              },
              order: {
                id: 'ASC',
              },
            });

            deepStrictEqual(
              absencesBeforeUpdate.map(({ type, id }) => ({ type, id })),
              absencesAfterUpdate.map(({ type, id }) => ({ type, id }))
            );
          });
          it(`sets all future absences to ${absenceEnumToTitleCase(ABSENCE_TYPE.NO_LONGER_ACTIVE)}`, async function () {
            await request(api)
              .put(`/api/faculty/absence/${springAbsence.id}`)
              .send({
                id: springAbsence.id,
                type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
              });
            const absences = (await absenceRepository.find({
              select: ['type'],
              relations: ['semester'],
              where: { faculty: springAbsence.faculty.id },
              order: {
                type: 'ASC',
              },
            }))
              .filter(({ semester }) => parseInt(semester.academicYear, 10)
                > thisAcademicYear);

            deepStrictEqual(
              absences
                .every(({ type }) => type === ABSENCE_TYPE.NO_LONGER_ACTIVE),
              true
            );
          });
          it('only updates spring of the next academic year if editing spring', async function () {
            const fallBeforeUpdate = await absenceRepository.findOne({
              select: ['updatedAt'],
              where: { id: fallAbsence.id },
            });
            await request(api)
              .put(`/api/faculty/absence/${springAbsence.id}`)
              .send({
                id: springAbsence.id,
                type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
              });

            const fallAfterUpdate = await absenceRepository.findOne({
              select: ['id', 'updatedAt', 'createdAt'],
              where: { id: fallAbsence.id },
            });
            const springAfterUpdate = await absenceRepository
              .findOne(springAbsence.id);

            strictEqual(springAfterUpdate.type, ABSENCE_TYPE.NO_LONGER_ACTIVE);
            deepStrictEqual(
              fallAfterUpdate.updatedAt,
              fallBeforeUpdate.updatedAt
            );
          });
          it('updates fall of the current academic year and spring of the next academic year if updating fall', async function () {
            await request(api)
              .put(`/api/faculty/absence/${fallAbsence.id}`)
              .send({
                id: fallAbsence.id,
                type: ABSENCE_TYPE.NO_LONGER_ACTIVE,
              });

            const [
              fallAfterUpdate,
              springAfterUpdate,
            ] = await absenceRepository.find({
              relations: ['semester'],
              where: { id: In([springAbsence.id, fallAbsence.id]) },
            });
            strictEqual(fallAfterUpdate.type, ABSENCE_TYPE.NO_LONGER_ACTIVE);
            strictEqual(springAfterUpdate.type, ABSENCE_TYPE.NO_LONGER_ACTIVE);
          });
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api)
            .put(`/api/faculty/absence/${absenceThisYear.id}`)
            .send(absenceThisYear);

          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
});
