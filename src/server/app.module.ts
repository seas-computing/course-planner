import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import session from 'express-session';
import ConnectRedis from 'connect-redis';
import { HarvardKeyStrategy } from 'server/auth/harvardkey.strategy';
import { DevStrategy } from 'server/auth/dev.strategy';
import { SessionModule, NestSessionOptions } from 'nestjs-session';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { CourseModule } from './course/course.module';
import { FacultyModule } from './faculty/faculty.module';
import { CourseInstanceModule } from './courseInstance/courseInstance.module';
import { MetadataModule } from './metadata/metadata.module';
import { UserController } from './user/user.controller';

/**
 * Base application module that configures the database connections and other
 * resources used by the application.
 */

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (
        config: ConfigService
      ): TypeOrmModuleOptions => (config.dbOptions),
      inject: [ConfigService],
    }),
    SessionModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        config: ConfigService
      ): NestSessionOptions => {
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
              domain: config.get('COOKIE_DOMAIN'),
              secure: config.isProduction,
            },
            store,
            resave: false,
            saveUninitialized: false,
            unset: 'destroy',
          },
        };
      },
    }),
    AuthModule.register({
      strategies: [HarvardKeyStrategy, DevStrategy],
    }),
    CourseModule,
    FacultyModule,
    CourseInstanceModule,
    MetadataModule,
  ],
  controllers: [
    UserController,
  ],
  providers: [],
})
class AppModule { }

export { AppModule };
