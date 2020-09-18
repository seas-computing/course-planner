import { Test, TestingModule } from '@nestjs/testing';
import { stub } from 'sinon';
import { regularUser } from 'testData';
import { deepStrictEqual, strictEqual } from 'assert';
import { UnauthorizedException } from '@nestjs/common';
import { SAMLStrategy, HarvardKeyProfile } from '../saml.strategy';
import { ConfigService } from '../../config/config.service';

describe('SAML Strategy', function () {
  const config = {
    isProduction: null,
    get: stub(),
  };

  afterEach(function () {
    config.get.resetHistory();
  });

  it('re-maps harvard key user info to a user object', async function () {
    config.isProduction = true;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: config,
        },
        SAMLStrategy,
      ],
    }).compile();

    const saml = module.get<SAMLStrategy>(SAMLStrategy);

    const {
      eppn,
      lastName,
      firstName,
      email,
    } = regularUser;

    const user = saml.validate({
      eppn,
      givenName: firstName,
      sn: lastName,
      email,
    } as HarvardKeyProfile);

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
        SAMLStrategy,
      ],
    }).compile();

    const saml = module.get<SAMLStrategy>(SAMLStrategy);

    try {
      saml.validate();
    } catch (error) {
      strictEqual(error instanceof UnauthorizedException, true);
    }
  });
});
