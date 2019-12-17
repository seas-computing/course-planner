import { Test, TestingModule } from '@nestjs/testing';
import { stub, SinonStub } from 'sinon';
import request from 'supertest';
import { HttpStatus, HttpServer } from '@nestjs/common';
import { strictEqual } from 'assert';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthGuard } from '@nestjs/passport';
import { ConfigModule } from '../../../../src/server/config/config.module';
import { AuthModule } from '../../../../src/server/auth/auth.module';
import { Course } from '../../../../src/server/course/course.entity';
import { CourseModule } from '../../../../src/server/course/course.module';
import { ConfigService } from '../../../../src/server/config/config.service';

const mockCourseRepository = {
  find: stub(),
};

describe('Course API', function () {
  let authStub: SinonStub;
  let api: HttpServer;

  beforeEach(async function () {
    authStub = stub(AuthGuard('saml').prototype, 'canActivate');
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        AuthModule,
        CourseModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({ NODE_ENV: 'production' }))

      .overrideProvider(getRepositoryToken(Course))
      .useValue(mockCourseRepository)

      .compile();

    const nestApp = await module.createNestApplication().init();

    api = nestApp.getHttpServer();
  });
  afterEach(function () {
    authStub.restore();
  });
  describe('GET /', function () {
    describe('User is not authenticated', function () {
      it('is inaccessible to unauthenticated users', async function () {
        authStub.returns(false);

        const response = await request(api).get('/api/courses');

        strictEqual(response.ok, false);
        strictEqual(response.status, HttpStatus.FORBIDDEN);
        strictEqual(mockCourseRepository.find.callCount, 0);
      });
    });
    describe('User is authenticated', function () {
      it('returns all the courses in the database', async function () {
        authStub.returns(true);
        const mockCourses = Array(10).fill(new Course());
        mockCourseRepository.find.resolves(mockCourses);

        const response = await request(api).get('/api/courses');

        strictEqual(response.ok, true);
        strictEqual(response.body.length, mockCourses.length);
        strictEqual(mockCourseRepository.find.callCount, 1);
      });
    });
  });
});
