import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import session, { Store } from 'express-session';
import ConnectRedis from 'connect-redis';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { AuthModule } from './auth/auth.module';
import { SessionMiddleware } from './auth/session.middleware';
import { CourseModule } from './course/course.module';
import { FacultyModule } from './faculty/faculty.module';

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
    AuthModule,
    CourseModule,
    FacultyModule,
  ],
  controllers: [],
  providers: [
    {
      inject: [ConfigService],
      provide: Store,
      useFactory: (config: ConfigService): Store => {
        const RedisStore = ConnectRedis(session);

        return new RedisStore({
          ...config.redisOptions,
          logErrors: config.isDevelopment,
        });
      },
    },
  ],
})
class AppModule implements NestModule {
  private readonly config: ConfigService;

  public constructor(config: ConfigService) {
    this.config = config;
  }

  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SessionMiddleware).forRoutes('*');
    if (this.config.isDevelopment) {
      // eslint-disable-next-line
      const { devServer, hotServer } = require('./config/dev.middleware');
      consumer.apply(devServer, hotServer).forRoutes('/');
    }
  }
}

export { AppModule };
