import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { RedisStoreOptions } from 'connect-redis';
import { AUTH_MODE } from 'common/constants';

/**
 * Parses process.env to create a clean configuration interface
 */

class ConfigService {
  private readonly env: { [key: string]: string };

  public constructor(config: { [key: string]: string } = {}) {
    this.env = config;
  }

  /**
   * Return a single value from the environment
   */

  public get(key: string): string {
    return this.env[key];
  }

  /**
   * Return connection parameters for the TypeORM module
   */

  public get dbOptions(): PostgresConnectionOptions {
    const {
      DB_HOSTNAME,
      DB_PORT,
      DB_DATABASE,
      DB_USERNAME,
      DB_PASSWORD,
    } = this.env;
    return {
      type: 'postgres',
      database: DB_DATABASE,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      host: DB_HOSTNAME,
      port: parseInt(DB_PORT),
      entities: this.isProduction
        ? ['server/**/*.entity.js']
        : ['src/server/**/*.entity.ts'],
    };
  }

  /**
   * Return connection parameters for the Redis Module
   */

  public get redisOptions(): RedisStoreOptions {
    const {
      REDIS_HOST,
      REDIS_PORT,
      REDIS_PASSWORD,
      REDIS_PREFIX,
    } = this.env;
    return {
      host: REDIS_HOST,
      port: parseInt(REDIS_PORT),
      pass: REDIS_PASSWORD,
      prefix: REDIS_PREFIX + '_',
    };
  }

  /**
   * check if the app is currently running in production
   */

  public get isProduction(): boolean {
    return this.env.NODE_ENV === 'production';
  }

  /**
   * check if the app is currently running in development mode
   */

  public get isDevelopment(): boolean {
    return this.env.NODE_ENV === 'development';
  }

  /**
   * Determine what kind of authentication should be used
   */
  public get authMode(): AUTH_MODE {
    if (this.isProduction) {
      return AUTH_MODE.HKEY;
    }
    if (this.isDevelopment) {
      return AUTH_MODE.DEV;
    }
    return AUTH_MODE.TEST;
  }

  /**
   * Determine the current academic year based on server time
   *
   * If the date is between Jan 1st and Jun 30th (inclusive),
   * then the academic year is the current calendar year.
   * If the date is between Jul 1st and Dec 31st (inclusive),
   * then the academic year is the next calendar year.
   */
  public get academicYear(): string {
    const now = new Date();
    const calendarYear = now.getFullYear();
    const JUNE = 5;
    const academicYear = now.getMonth() <= JUNE
      ? calendarYear
      : calendarYear + 1;
    return academicYear.toString();
  }
}

export { ConfigService };
