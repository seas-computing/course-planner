import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import request from 'supertest';
import {
  INestApplication,
  HttpStatus,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { strictEqual } from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FACULTY_TYPE } from '../../../../src/common/constants';
import { Area } from '../../../../src/server/area/area.entity';
import { FacultyModule } from '../../../../src/server/faculty/faculty.module';
import { Faculty } from '../../../../src/server/faculty/faculty.entity';

const mockFacultyRepository = {
  find: stub(),
  save: stub(),
  create: stub(),
};

describe('Faculty API', function () {
  describe('POST /', function () {
    let facultyAPI: INestApplication;
    beforeEach(async function () {
      const module: TestingModule = await Test.createTestingModule({
        imports: [FacultyModule],
      })
        .overrideProvider(getRepositoryToken(Faculty))
        .useValue(mockFacultyRepository)
        .compile();
      facultyAPI = module.createNestApplication();
      facultyAPI.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory:
          (errors): BadRequestException => new BadRequestException(
            errors.map(({ constraints }): string[] => Object
              .entries(constraints)
              .map(([, value]): string => value)).join()
          ),
      }));
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
  describe('PUT /', function () {
    let facultyAPI: INestApplication;
    beforeEach(async function () {
      const module: TestingModule = await Test.createTestingModule({
        imports: [FacultyModule],
      })
        .overrideProvider(getRepositoryToken(Faculty))
        .useValue(mockFacultyRepository)
        .compile();
      facultyAPI = module.createNestApplication();
      facultyAPI.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        exceptionFactory:
          (errors): BadRequestException => new BadRequestException(
            errors.map(({ constraints }): string[] => Object
              .entries(constraints)
              .map(([, value]): string => value)).join()
          ),
      }));
      await facultyAPI.init();
    });
    it('updates a faculty member entry in the database', async function () {
      const response = await request(facultyAPI.getHttpServer())
        .put('/api/faculty/a49edd11-0f2d-4d8f-9096-a4062955a11a')
        .send({
          HUID: '87654321',
          firstName: 'Grace',
          lastName: 'Hopper',
          facultyType: FACULTY_TYPE.NON_SEAS_LADDER,
          area: {
            id: 'c16ehj34-1gge-5d3j-1251-ah153144b22w',
            name: 'AP',
          },
        });

      strictEqual(response.ok, true);
      strictEqual(response.status, HttpStatus.OK);
    });
    it('reports validation errors', async function () {
      const response = await request(facultyAPI.getHttpServer())
        .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
        .send({
          firstName: 'Ada',
          lastName: 'Lovelace',
          facultyType: FACULTY_TYPE.LADDER,
          area: new Area(),
        });

      strictEqual(response.ok, false);
      strictEqual(response.status, HttpStatus.BAD_REQUEST);
    });
    it('allows you to update a faculty member so that the entry has a last name but no first name', async function () {
      const response = await request(facultyAPI.getHttpServer())
        .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
        .send({
          HUID: '12345678',
          lastName: 'Chen',
          facultyType: FACULTY_TYPE.NON_LADDER,
          area: {
            id: 'j41edd11-0g34-4h4a-1112-a4062955g62k',
            name: 'AP',
          },
        });

      strictEqual(response.ok, true);
      strictEqual(response.status, HttpStatus.OK);
    });
    it('allows you to update a faculty member so that the entry has a first name but no last name', async function () {
      const response = await request(facultyAPI.getHttpServer())
        .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
        .send({
          HUID: '12345678',
          firstName: 'James',
          facultyType: FACULTY_TYPE.NON_SEAS_LADDER,
          area: {
            id: 'a49edd11-0f2d-4d8f-9096-a4062955a11a',
            name: 'ACS',
          },
        });

      strictEqual(response.ok, true);
      strictEqual(response.status, HttpStatus.OK);
    });
    it('does not allow you to update faculty member so that the entry has neither first nor last name', async function () {
      const response = await request(facultyAPI.getHttpServer())
        .put('/api/faculty/g12gaa52-1gj5-ha21-1123-hn625632n123')
        .send({
          HUID: '24681012',
          facultyType: FACULTY_TYPE.NON_LADDER,
          area: {
            id: 'n01dt301-1f3n-3yag-3232-ty12345jr16h',
            name: 'Mat & ME',
          },
        });

      strictEqual(response.ok, false);
      strictEqual(response.status, HttpStatus.BAD_REQUEST);
    });
  });
});
