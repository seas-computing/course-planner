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
          facultyType: FACULTY_TYPE.LADDER,
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
          facultyType: FACULTY_TYPE.LADDER,
          area: new Area(),
        });

      strictEqual(response.ok, false);
      strictEqual(response.status, HttpStatus.BAD_REQUEST);
    });
  });
});
