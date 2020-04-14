import { join } from 'path';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import session from 'express-session';
import ConnectRedis from 'connect-redis';
import { SAMLStrategy } from 'server/auth/saml.strategy';
import { DevStrategy } from 'server/auth/dev.strategy';
import { SessionModule, NestSessionOptions } from 'nestjs-session';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { FacultyModule } from './faculty/faculty.module';
import { CourseInstanceModule } from './courseInstance/courseInstance.module';

/**
 * Base application module that injects Mongoose and configures
 * all necessary middleware.
 */

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        config: ConfigService
      ): Promise<TypeOrmModuleOptions> => (config.dbOptions),
      inject: [ConfigService],
    }),
    SessionModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (
        config: ConfigService
      ): Promise<NestSessionOptions> => {
        const RedisStore = ConnectRedis(session);
        const store = new RedisStore({
          ...config.redisOptions,
          logErrors: config.isDevelopment,
        });
        return {
          session: {
            secret: config.get('SESSION_SECRET'),
            cookie: {
              maxAge: 1000 * 60 * 60 * 24 * 7,
            },
            store,
            resave: true,
            saveUninitialized: false,
          },
        };
      },
    }),
    AuthModule.register({
      strategies: [SAMLStrategy, DevStrategy],
    }),
    CourseModule,
    FacultyModule,
    CourseInstanceModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [],
  providers: [],
})
class AppModule implements NestModule {
  private readonly config: ConfigService;

  public constructor(config: ConfigService) {
    this.config = config;
  }

  public configure(consumer: MiddlewareConsumer): void {
    if (this.config.isDevelopment) {
      // eslint-disable-next-line
      const { devServer, hotServer } = require('./config/dev.middleware');
      consumer.apply(devServer, hotServer).forRoutes('/');
      consumer.apply(devServer, hotServer).forRoutes('/courses/*');
    }
  }
}

export { AppModule };
