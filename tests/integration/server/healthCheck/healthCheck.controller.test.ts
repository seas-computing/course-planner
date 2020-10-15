import request from 'supertest';
import { strictEqual } from 'assert';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpServer, INestApplication, HttpStatus } from '@nestjs/common';
import { HealthCheckController } from 'server/healthCheck/healthCheck.controller';
import { BadRequestExceptionPipe } from 'server/utils/BadRequestExceptionPipe';

describe('Health Check API', function () {
  let nestApp: INestApplication;
  let api: HttpServer;

  beforeEach(async function () {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [
        HealthCheckController,
      ],
    }).compile();

    nestApp = await moduleRef.createNestApplication()
      .useGlobalPipes(new BadRequestExceptionPipe())
      .init();

    api = nestApp.getHttpServer() as HttpServer;
  });
  context('When server is running', function () {
    it('Should return a status of "OK"', async function () {
      const result = await request(api).get('/health-check/');
      strictEqual(result.status, HttpStatus.OK);
      strictEqual(result.body.status, 'OK');
    });
  });
});
