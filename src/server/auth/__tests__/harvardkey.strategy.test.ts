import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import { regularUser } from 'testData';
import { deepStrictEqual, strictEqual } from 'assert';
import { UnauthorizedException } from '@nestjs/common';
import { HarvardKeyProfile } from '@seas-computing/passport-harvardkey';
import { Request } from 'express';
import { HarvardKeyStrategy } from '../harvardkey.strategy';
import { ConfigService } from '../../config/config.service';

describe('HarvardKey Strategy', function () {
  const config = {
    isProduction: null,
    get: stub(),
  };

  afterEach(function () {
    config.get.resetHistory();
  });

  it('re-maps harvard key user info to a user object', async function () {
    config.isProduction = true;
    config.get.withArgs('CAS_URL').returns('https://cas-example.com/cas');
    config.get.withArgs('SERVER_URL').returns('https://server-example.com');
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: config,
        },
        HarvardKeyStrategy,
      ],
    }).compile();

    const hkey = module.get<HarvardKeyStrategy>(HarvardKeyStrategy);

    const {
      eppn,
      lastName,
      firstName,
    } = regularUser;

    const user = hkey.validate(
      {
        eppn,
        givenName: firstName,
        sn: lastName,
        displayName: `${lastName}, ${firstName}`,
      } as HarvardKeyProfile,
      {} as Request
    );

    deepStrictEqual(user, regularUser);
  });
  it('rejects failed auth attempts with an exception', async function () {
    config.isProduction = true;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: config,
        },
        HarvardKeyStrategy,
      ],
    }).compile();

    const hkey = module.get<HarvardKeyStrategy>(HarvardKeyStrategy);

    try {
      hkey.validate(
        null,
        {} as Request
      );
    } catch (error) {
      strictEqual(error instanceof UnauthorizedException, true);
    }
  });
});
