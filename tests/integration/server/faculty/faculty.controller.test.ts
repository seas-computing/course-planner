import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import {
  HttpStatus,
  HttpServer,
} from '@nestjs/common';
import { strictEqual } from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import session from 'express-session';
import { Request, Response, NextFunction } from 'express';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { FACULTY_TYPE } from '../../../../src/common/constants';
import { Area } from '../../../../src/server/area/area.entity';
import { FacultyModule } from '../../../../src/server/faculty/faculty.module';
import { Faculty } from '../../../../src/server/faculty/faculty.entity';
import { AuthModule } from '../../../../src/server/auth/auth.module';
import { ConfigModule } from '../../../../src/server/config/config.module';
import { ConfigService } from '../../../../src/server/config/config.service';
import { BadRequestExceptionPipe } from '../../../../src/server/utils/BadRequestExceptionPipe';
import { regularUser, string, adminUser } from '../../../../src/common/__tests__/data';

const mockFacultyRepository = {
  create: stub(),
  save: stub(),
  findOneOrFail: stub(),
  find: stub(),
};

const mockAreaRepository = {
  findOneOrFail: stub(),
};

describe('Faculty API', function () {
  let authStub: SinonStub;
  let api: HttpServer;
  let userStub: SinonStub;

  beforeEach(async function () {
    userStub = stub();
    authStub = stub(AuthGuard('saml').prototype, 'canActivate');
    userStub.returns(regularUser);

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        FacultyModule,
        AuthModule,
        ConfigModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ NODE_ENV: 'production' }))

      .overrideProvider(getRepositoryToken(Faculty))
      .useValue(mockFacultyRepository)

      .overrideProvider(getRepositoryToken(Area))
      .useValue(mockAreaRepository)

      .compile();

    const nestApp = await module.createNestApplication()
      .use(session({
        secret: string,
        resave: true,
        saveUninitialized: true,
      }))
      .use((req: Request, _: Response, next: NextFunction) => {
        req.session.user = userStub();
        next();
      })
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer();
  });
  afterEach(function () {
    authStub.restore();
    userStub.reset();
    Object.values({
      ...mockFacultyRepository,
      ...mockAreaRepository,
    })
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });
  describe('GET /', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.returns(false);

        const response = await request(api).get('/api/faculty');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyRepository.find.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        it('returns all faculty in the database', async function () {
          authStub.returns(true);
          userStub.returns(adminUser);
          const mockFaculty = Array(10).fill({
            ...new Faculty(),
            area: new Area(),
          });
          mockFacultyRepository.find.resolves(mockFaculty);

          const response = await request(api).get('/api/faculty');

          strictEqual(response.ok, true);
          strictEqual(response.body.length, mockFaculty.length);
          strictEqual(mockFacultyRepository.find.callCount, 1);
        });
      });
      describe('User is not a member of the admin group', async function () {
        authStub.returns(true);
        userStub.returns(regularUser);

        const response = await request(api).get('/api/faculty');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyRepository.find.callCount, 0);
      });
    });
  });
  describe('POST /', function () {
    describe('User is not authenticated', function () {
      beforeEach(function () {
        authStub.returns(false);
      });
      it('cannot create a faculty entry', async function () {
        const response = await request(api)
          .post('/api/faculty')
          .send({
            HUID: '87654321',
            firstName: 'Grace',
            lastName: 'Hopper',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: {
              id: 'c16ehj34-1gge-5d3j-1251-ah153144b22w',
              name: 'AP',
            },
          });
        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyRepository.create.callCount, 0);
      });
    });

    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        beforeEach(async function () {
          authStub.returns(true);
          userStub.returns(adminUser);
        });
        it('creates a new faculty member in the database', async function () {
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: '12345678',
              firstName: 'Sam',
              lastName: 'Johnston',
              category: FACULTY_TYPE.LADDER,
              area: {
                id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
                name: 'ACS',
              },
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('reports validation errors', async function () {
          const response = await request(api)
            .post('/api/faculty')
            .send({
              firstName: 'Sam',
              lastName: 'Johnston',
              category: FACULTY_TYPE.LADDER,
              area: new Area(),
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(response.body.message.includes('HUID'), true);
        });
        it('allows you to create a faculty member with a last name and no first name', async function () {
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: '12345678',
              lastName: 'Chen',
              category: FACULTY_TYPE.LADDER,
              area: {
                id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
                name: 'ACS',
              },
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('allows you to create a faculty member with a first name and no last name', async function () {
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: '12345678',
              firstName: 'Ada',
              category: FACULTY_TYPE.LADDER,
              area: {
                id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
                name: 'ACS',
              },
            });
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.CREATED);
        });
        it('does not allow you to create a faculty member with both no first name and no last name', async function () {
          const response = await request(api)
            .post('/api/faculty')
            .send({
              HUID: '12345678',
              category: FACULTY_TYPE.LADDER,
              area: {
                id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
                name: 'ACS',
              },
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.returns(true);
          userStub.returns(regularUser);

          const response = await request(api).get('/api/faculty');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockFacultyRepository.find.callCount, 0);
        });
      });
    });
  });
  describe('PUT /:id', function () {
    describe('User is not authenticated', function () {
      beforeEach(async function () {
        authStub.returns(false);
      });
      it('cannot update a faculty entry', async function () {
        const response = await request(api)
          .put('/api/faculty/a49edd11-0f2d-4d8f-9096-a4062955a11a')
          .send({
            id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
            HUID: '87654321',
            firstName: 'Grace',
            lastName: 'Hopper',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: {
              id: 'c16ehj34-1gge-5d3j-1251-ah153144b22w',
              name: 'AP',
            },
          });
        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockFacultyRepository.save.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      describe('User is a member of the admin group', function () {
        beforeEach(async function () {
          authStub.returns(true);
          userStub.returns(adminUser);
        });
        it('updates a faculty member entry in the database', async function () {
          const newArea = {
            id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
            name: 'AP',
          };
          const newFacultyMemberInfo = {
            id: 'df15cfff-0f6f-4769-8841-1ab8a9c335d9',
            HUID: '87654321',
            firstName: 'Grace',
            lastName: 'Hopper',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: newArea,
          };
          mockAreaRepository.findOneOrFail.resolves(newArea);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put('/api/faculty/df15cfff-0f6f-4769-8841-1ab8a9c335d9')
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('reports validation errors', async function () {
          const response = await request(api)
            .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
            .send({
              id: 'g12gaa52-1gj5-ha21-1123-hn625632n123',
              HUID: '01234567',
              firstName: 'Ada',
              lastName: 'Lovelace',
              area: new Area(),
            });
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(response.body.message.includes('category'), true);
        });
        it('allows you to update a faculty member so that the entry has a last name but no first name', async function () {
          const newArea = {
            id: 'i20bae22-0f2d-4d8g-9096-h12gbc4b72k',
            name: 'AP',
          };
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            lastName: 'Hopper',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: newArea,
          };
          mockAreaRepository.findOneOrFail.resolves(newArea);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put('/api/faculty/69694326-4d12-4c32-8a26-b2c28352ba31')
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('allows you to update a faculty member so that the entry has a first name but no last name', async function () {
          const newArea = {
            id: 'i20bae22-0f2d-4d8g-9096-h12gbc4b72k',
            name: 'AP',
          };
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            firstName: 'Grace',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: newArea,
          };
          mockAreaRepository.findOneOrFail.resolves(newArea);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, true);
          strictEqual(response.status, HttpStatus.OK);
        });
        it('does not allow you to update faculty member so that the entry has neither first nor last name', async function () {
          const newArea = {
            id: 'i20bae22-0f2d-4d8g-9096-h12gbc4b72k',
            name: 'AP',
          };
          const newFacultyMemberInfo = {
            id: 'g12gaa52-1gj5-ha21-1123-hn625632n123',
            HUID: '87654321',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: newArea,
          };
          mockAreaRepository.findOneOrFail.resolves(newArea);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
        });
        it('throws a Not Found exception if faculty does not exist', async function () {
          const newArea = {
            id: 'i20bae22-0f2d-4d8g-9096-h12gbc4b72k',
            name: 'AP',
          };
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            lastName: 'Huntington',
            category: FACULTY_TYPE.NON_SEAS_LADDER,
            area: newArea,
          };
          mockAreaRepository.findOneOrFail.resolves(newArea);
          mockFacultyRepository.findOneOrFail.rejects(new EntityNotFoundError(Faculty, `${newFacultyMemberInfo.id}`));
          mockFacultyRepository.save.resolves(false);
          const response = await request(api)
            .put(`/api/faculty/${newFacultyMemberInfo.id}`)
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.NOT_FOUND);
          strictEqual(response.body.message.includes('Faculty', 'ID'), true);
        });
        it('throws a Bad Request exception if area does not exist', async function () {
          const newArea = {
            id: 'abc32sdf-84923-fm32-1111-72jshckddiws',
            name: 'Juggling',
          };
          const newFacultyMemberInfo = {
            id: '69694326-4d12-4c32-8a26-b2c28352ba31',
            HUID: '87654321',
            lastName: 'Brown',
            category: FACULTY_TYPE.NON_LADDER,
            area: newArea,
          };
          mockFacultyRepository.save.resolves(newFacultyMemberInfo);
          mockAreaRepository.findOneOrFail.resolves(false);
          mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
          const response = await request(api)
            .put(`/api/faculty/${newArea.id}`)
            .send(newFacultyMemberInfo);
          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.BAD_REQUEST);
          strictEqual(response.body.message.includes('Area'), true);
        });
      });
      describe('User is not a member of the admin group', function () {
        it('is inaccessible to unauthorized users', async function () {
          authStub.returns(true);
          userStub.returns(regularUser);

          const response = await request(api).get('/api/faculty');

          strictEqual(response.ok, false);
          strictEqual(response.status, HttpStatus.FORBIDDEN);
          strictEqual(mockFacultyRepository.find.callCount, 0);
        });
      });
    });
  });
});
