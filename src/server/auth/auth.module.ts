import { Module, DynamicModule, Global } from '@nestjs/common';
import {
  AuthGuard, PassportModule, Type, IAuthGuard,
} from '@nestjs/passport';
import { Authentication } from 'server/auth/authentication.guard';
import { Strategy } from 'passport';
import { ConfigModule } from 'server/config/config.module';
import { ConfigService } from 'server/config/config.service';
import { AUTH_MODE } from 'common/constants';

/**
 * A dynamic module that creates a custom Authentication module depending on
 * the current environment. Essentially this is just injecting the custom
 * [[Authentication]] guard, using whichever Passport Strategy corresponds to
 * the current value of NODE_ENV.
 */

@Global()
@Module({})
class AuthModule {
  public static register({
    strategies,
    defaultStrategy,
  }: {
    strategies: Type<Strategy>[];
    defaultStrategy: AUTH_MODE;
  }): DynamicModule {
    return {
      module: AuthModule,
      imports: [
        ...strategies,
        ConfigModule,
        PassportModule.register({
          session: true,
          property: 'user',
          defaultStrategy,
        }),
      ],
      providers: [
        ...strategies,
        {
          provide: Authentication,
          inject: [ConfigService],
          useFactory: (
            config: ConfigService
          ): Type<IAuthGuard> => AuthGuard(config.authMode),
        },
      ],
      exports: [PassportModule, Authentication],
    };
  }
}

export { AuthModule };
