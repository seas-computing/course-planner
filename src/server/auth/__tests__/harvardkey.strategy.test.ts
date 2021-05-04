import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import * as dummy from 'testData';
import { throws, deepStrictEqual } from 'assert';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Session } from 'express-session';
import { HarvardKeyStrategy } from '../harvardkey.strategy';
import { ConfigService } from '../../config/config.service';

describe('HarvardKeyStrategy', function () {
  let hkey: HarvardKeyStrategy;

  const config = {
    isProduction: null,
    get: stub(),
  };

  beforeEach(async function () {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: config,
        },
        HarvardKeyStrategy,
      ],
    })
      .compile();

    hkey = moduleRef.get<HarvardKeyStrategy>(HarvardKeyStrategy);
  });

  context('When there is a user saved in session', function () {
    it('returns the user', function () {
      const testSession = {
        user: dummy.regularUser,
      } as unknown as Session;
      const result = hkey.validate({
        session: testSession,
      } as Request);
      deepStrictEqual(result, dummy.regularUser);
    });
  });
  context('When there is no user in session', function () {
    it('throws an UnauthorizedException', function () {
      const testSession = {} as Session;
      throws((): void => {
        hkey.validate({
          session: testSession,
        } as Request);
      }, UnauthorizedException);
    });
  });
});
