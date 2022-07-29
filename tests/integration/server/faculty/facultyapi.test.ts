import { ForbiddenException, HttpServer, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { deepStrictEqual, strictEqual } from 'assert';
import { AxiosResponse } from 'axios';
import { AUTH_MODE } from 'common/constants';
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
  adminUser, appliedMathFacultyMemberRequest, bioengineeringFacultyMember, regularUser, string,
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
    areaRepository = testModule.get(getRepositoryToken(Area));

    const app = await testModule.createNestApplication().init();
    api = app.getHttpServer() as HttpServer<Request, Response>;
  });
  afterEach(async function () {
    await testModule.close();
  });
});
