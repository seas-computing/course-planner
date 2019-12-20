import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import {
  INestApplication,
  HttpStatus,
} from '@nestjs/common';
import { strictEqual } from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityNotFoundError } from 'typeorm/error/EntityNotFoundError';
import { FACULTY_TYPE } from '../../../../src/common/constants';
import { Area } from '../../../../src/server/area/area.entity';
import { FacultyModule } from '../../../../src/server/faculty/faculty.module';
import { Faculty } from '../../../../src/server/faculty/faculty.entity';
import { AuthModule } from '../../../../src/server/auth/auth.module';
import { ConfigModule } from '../../../../src/server/config/config.module';
import { Authentication } from '../../../../src/server/auth/authentication.guard';
import { BadRequestExceptionPipe } from '../../../../src/server/utils/BadRequestExceptionPipe';

const mockFacultyRepository = {
  create: stub(),
  save: stub(),
  findOneOrFail: stub(),
};

const mockAreaRepository = {
  findOneOrFail: stub(),
};

describe('Faculty API', function () {
  let module: TestingModuleBuilder;
  let authenticationStub: SinonStub;
  beforeEach(async function () {
    authenticationStub = stub(Authentication.prototype, 'canActivate');
    module = await Test.createTestingModule({
      imports: [FacultyModule, AuthModule, ConfigModule],
    })
      .overrideProvider(getRepositoryToken(Faculty))
      .useValue(mockFacultyRepository)
      .overrideProvider(getRepositoryToken(Area))
      .useValue(mockAreaRepository);
  });
  afterEach(function () {
    authenticationStub.restore();
    Object.values({
      ...mockFacultyRepository,
      ...mockAreaRepository,
    })
      .forEach((sinonStub: SinonStub): void => {
        sinonStub.reset();
      });
  });
  describe('POST /', function () {
    describe('User is not authenticated', function () {
      let facultyAPI: INestApplication;
      beforeEach(async function () {
        authenticationStub.returns(false);
        const app = await module
          .compile();
        facultyAPI = app.createNestApplication();
        facultyAPI.useGlobalPipes(new BadRequestExceptionPipe());
        await facultyAPI.init();
      });
      it('cannot create a faculty entry', async function () {
        const response = await request(facultyAPI.getHttpServer())
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
      let facultyAPI: INestApplication;
      beforeEach(async function () {
        authenticationStub.returns(true);
        const app = await module
          .compile();
        facultyAPI = app.createNestApplication();
        facultyAPI.useGlobalPipes(new BadRequestExceptionPipe());
        await facultyAPI.init();
      });
      it('creates a new faculty member in the database', async function () {
        const response = await request(facultyAPI.getHttpServer())
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
        const response = await request(facultyAPI.getHttpServer())
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
        const response = await request(facultyAPI.getHttpServer())
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
        const response = await request(facultyAPI.getHttpServer())
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
        const response = await request(facultyAPI.getHttpServer())
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
  });
  describe('PUT /:id', function () {
    describe('User is not authenticated', function () {
      let facultyAPI: INestApplication;
      beforeEach(async function () {
        authenticationStub.returns(false);
        const app = await module
          .compile();
        facultyAPI = app.createNestApplication();
        facultyAPI.useGlobalPipes(new BadRequestExceptionPipe());
        await facultyAPI.init();
      });
      it('cannot update a faculty entry', async function () {
        const response = await request(facultyAPI.getHttpServer())
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
      let facultyAPI: INestApplication;
      beforeEach(async function () {
        authenticationStub.returns(true);
        const app = await module
          .compile();
        facultyAPI = app.createNestApplication();
        facultyAPI.useGlobalPipes(new BadRequestExceptionPipe());
        await facultyAPI.init();
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
        const response = await request(facultyAPI.getHttpServer())
          .put('/api/faculty/df15cfff-0f6f-4769-8841-1ab8a9c335d9')
          .send(newFacultyMemberInfo);
        strictEqual(response.ok, true);
        strictEqual(response.status, HttpStatus.OK);
      });
      it('reports validation errors', async function () {
        const response = await request(facultyAPI.getHttpServer())
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
          id: 'g12gaa52-1gj5-ha21-1123-hn625632n123',
          HUID: '87654321',
          lastName: 'Hopper',
          category: FACULTY_TYPE.NON_SEAS_LADDER,
          area: newArea,
        };
        mockAreaRepository.findOneOrFail.resolves(newArea);
        mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
        mockFacultyRepository.save.resolves(newFacultyMemberInfo);
        const response = await request(facultyAPI.getHttpServer())
          .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
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
          id: 'g12gaa52-1gj5-ha21-1123-hn625632n123',
          HUID: '87654321',
          firstName: 'Grace',
          category: FACULTY_TYPE.NON_SEAS_LADDER,
          area: newArea,
        };
        mockAreaRepository.findOneOrFail.resolves(newArea);
        mockFacultyRepository.findOneOrFail.resolves(newFacultyMemberInfo);
        mockFacultyRepository.save.resolves(newFacultyMemberInfo);
        const response = await request(facultyAPI.getHttpServer())
          .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
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
        const response = await request(facultyAPI.getHttpServer())
          .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
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
          id: 'g12gaa52-1gj',
          HUID: '87654321',
          lastName: 'Huntington',
          category: FACULTY_TYPE.NON_SEAS_LADDER,
          area: newArea,
        };
        mockAreaRepository.findOneOrFail.resolves(newArea);
        mockFacultyRepository.findOneOrFail.rejects(new EntityNotFoundError(Faculty, 'g12gaa52-1gj'));
        mockFacultyRepository.save.resolves(false);
        const response = await request(facultyAPI.getHttpServer())
          .put('/api/faculty/g12gaa52-1gj')
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
        const response = await request(facultyAPI.getHttpServer())
          .put('/api/faculty/qa821aa52-1gj5-ha21-abw1-328n823ksala')
          .send(newFacultyMemberInfo);
        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.BAD_REQUEST);
        strictEqual(response.body.message.includes('Area'), true);
      });
    });
  });
});
