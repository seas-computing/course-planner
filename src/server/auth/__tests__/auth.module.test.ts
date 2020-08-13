import { strictEqual, deepStrictEqual } from 'assert';
import { spy, SinonSpy } from 'sinon';
import { AuthModule } from 'server/auth/auth.module';
import { DynamicModule, Type } from '@nestjs/common';
import { SAMLStrategy } from 'server/auth/saml.strategy';
import { DevStrategy } from 'server/auth/dev.strategy';
import { AUTH_MODE } from 'common/constants';
import { Strategy } from 'passport';
import { PassportModule, AuthModuleAsyncOptions, IAuthModuleOptions } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { TestingStrategy } from '../../../../tests/mocks/authentication/testing.strategy';

describe('AuthModule', function () {
  let resolvedMod: DynamicModule;
  let strategies: Type<Strategy>[];
  let defaultStrategy: AUTH_MODE;
  describe('strategy injection', function () {
    beforeEach(function () {
      strategies = [
        SAMLStrategy,
        DevStrategy,
      ];
      resolvedMod = AuthModule.register({ strategies });
    });
    it('should inject the passed strategies into the providers array', function () {
      deepStrictEqual(
        resolvedMod.providers.slice(0, strategies.length),
        strategies
      );
    });
    it('Should not inject any other strategies', function () {
      const hasTesting = resolvedMod.providers
        .findIndex(
          (provider) => provider === TestingStrategy
        ) > -1;
      strictEqual(hasTesting, false);
    });
  });
  describe('defaultStrategy', function () {
    let ppspy: SinonSpy;
    context('When a defaultStrategy is provided', function () {
      beforeEach(async function () {
        ppspy = spy(PassportModule, 'registerAsync');
        strategies = [
          SAMLStrategy,
          DevStrategy,
          TestingStrategy,
        ];
        defaultStrategy = AUTH_MODE.HKEY;
        await Test.createTestingModule({
          imports: [
            ConfigModule,
            AuthModule.register({ strategies, defaultStrategy }),
          ],
        })
          .overrideProvider(ConfigService)
          .useValue(new ConfigService({ NODE_ENV: 'testing' }))
          .compile();
      });
      it('Should use that strategy instead of config.authMode', function () {
        const passportMod = ppspy.args[0][0] as AuthModuleAsyncOptions;
        const {
          defaultStrategy: passedStrategy,
        } = passportMod
          .useFactory({ authMode: AUTH_MODE.TEST }) as IAuthModuleOptions;
        strictEqual(passedStrategy, defaultStrategy);
      });
    });
    context('When a defaultStrategy is NOT provided', function () {
      beforeEach(async function () {
        strategies = [
          SAMLStrategy,
          DevStrategy,
          TestingStrategy,
        ];
        ppspy = spy(PassportModule, 'registerAsync');
        await Test.createTestingModule({
          imports: [
            ConfigModule,
            AuthModule.register({ strategies }),
          ],
        })
          .overrideProvider(ConfigService)
          .useValue(new ConfigService({ NODE_ENV: 'testing' }))
          .compile();
      });
      afterEach(function () {
        ppspy.restore();
      });
      it('Should default to config.authMode', function () {
        const passportMod = ppspy.args[0][0] as AuthModuleAsyncOptions;
        const {
          defaultStrategy: passedStrategy,
        } = passportMod
          .useFactory({ authMode: AUTH_MODE.TEST }) as IAuthModuleOptions;
        strictEqual(passedStrategy, AUTH_MODE.TEST);
      });
    });
  });
});
