import {
  ForbiddenException, HttpServer, HttpStatus, ValidationError,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { deepStrictEqual, notStrictEqual, strictEqual } from 'assert';
import { ABSENCE_TYPE, AUTH_MODE } from 'common/constants';
import { InstructorResponseDTO } from 'common/dto/courses/InstructorResponse.dto';
import { Request, Response } from 'express';
import { SessionModule } from 'nestjs-session';
import { Absence } from 'server/absence/absence.entity';
import { Area } from 'server/area/area.entity';
import { AuthModule } from 'server/auth/auth.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyModule } from 'server/faculty/faculty.module';
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
import { Repository } from 'typeorm';
import { TestingStrategy } from '../../../mocks/authentication/testing.strategy';
import { PopulationModule } from '../../../mocks/database/population/population.module';

describe('Faculty API', function () {
  let authStub: SinonStub;
  let api: HttpServer;
  let facultyRepository: Repository<Faculty>;
  let areaRepository: Repository<Area>;
  let testModule: TestingModule;
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
    let facultyWithAbsences: Faculty;
    let existingAbsence: Absence;
    beforeEach(async function () {
      facultyWithAbsences = await facultyRepository
        .createQueryBuilder('f')
        .leftJoinAndMapMany(
          'f.absences',
          Absence, 'a',
          'a."facultyId" = f."id"'
        )
        .getOne();
      ([existingAbsence] = facultyWithAbsences.absences);
    });
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.rejects(new ForbiddenException());

        const response = await request(api)
          .put(`/api/faculty/absence/${existingAbsence.id}`)
          .send({
            ...existingAbsence,
            type: ABSENCE_TYPE.TEACHING_RELIEF,
          });

        strictEqual(response.status, HttpStatus.FORBIDDEN);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        beforeEach(function () {
          authStub.returns(adminUser);
        });
        it('updates a faculty member\'s absence entry in the database', async function () {
          const {
            status,
            body,
          } = await request(api)
            .put(`/api/faculty/absence/${existingAbsence.id}`)
            .send({
              ...existingAbsence,
              type: ABSENCE_TYPE.TEACHING_RELIEF,
            });
          strictEqual(status, HttpStatus.OK);
          notStrictEqual(body.updatedAt, existingAbsence.updatedAt);
        });
        it('throws a Not Found exception if absence does not exist', async function () {
          const { status, body } = await request(api)
            .put(`/api/faculty/absence/${uuid}`)
            .send({
              ...existingAbsence,
              id: uuid,
            });
          strictEqual(status, HttpStatus.NOT_FOUND);
          strictEqual((body.message as string).includes('Absence'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          const response = await request(api)
            .put(`/api/faculty/absence/${existingAbsence.id}`)
            .send(existingAbsence);

          strictEqual(response.status, HttpStatus.FORBIDDEN);
        });
      });
    });
  });
});
