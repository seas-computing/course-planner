import { ForbiddenException, HttpServer, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { deepStrictEqual, strictEqual } from 'assert';
import { AUTH_MODE } from 'common/constants';
import { InstructorResponseDTO } from 'common/dto/courses/InstructorResponse.dto';
import { Request, Response } from 'express';
import { SessionModule } from 'nestjs-session';
import { Area } from 'server/area/area.entity';
import { AuthModule } from 'server/auth/auth.module';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { Faculty } from 'server/faculty/faculty.entity';
import { FacultyModule } from 'server/faculty/faculty.module';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import {
  adminUser,
  appliedMathFacultyMemberRequest,
  bioengineeringFacultyMember,
  regularUser,
  string,
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

    const app = await testModule.createNestApplication().init();
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
});
